use log::{error, info};
use lsl::{Pushable, StreamOutlet};
use serde::{Deserialize, Serialize};
use std::{
    sync::mpsc::{channel, Receiver, Sender},
    thread::spawn,
};

pub struct LsLManager {
    sender: Sender<LsLMarker>,
}

pub struct LsL {
    recv: Receiver<LsLMarker>,
    event_outlet: StreamOutlet,
}

// The LsLMarker struct encoding the App events `LsLMarkerJson` in a u64.
// `block_type` says which of the remaining fields carry meaning: `session` has neither block nor
// trial, `test` marks a practice run, and only `calibration` and a `stimulus` rating carry data.
// This encoded marker is published by the App to LsL.
// Encoding:
// 8bit   | 8bit       | 8bit  | 8bit   | 16bit      | 8bit  | 8bit
// block  | block_type | trial | state  | image_id   | speed | data
#[derive(Debug, Clone, Copy)]
struct LsLMarker(i64);

impl From<&LsLMarkerJson> for LsLMarker {
    fn from(value: &LsLMarkerJson) -> Self {
        let mut v = 0i64;
        v |= (value.block as i64) << 56;
        v |= (value.block_type as i64) << 48;
        v |= (value.trial as i64) << 40;
        v |= (value.state as i64) << 32;
        v |= (value.image_id.unwrap_or(0) as i64) << 16;
        v |= (value.speed as i64) << 8;
        v |= value.data.map(|v| v.data()).unwrap_or(0) as i64;
        Self(v)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Packs a marker and checks it against the layout documented on `LsLMarker`:
    /// `block | block_type | trial | state | image_id | speed | data`.
    #[test]
    fn marker_repr() {
        let stimulus = LsLMarkerJson {
            block: 1,
            block_type: BlockType::Stimulus,
            trial: 1,
            state: StateMarker::Baseline,
            image_id: Some(50),
            speed: SpeedModifier::Normal,
            data: None,
        };
        assert_eq!(LsLMarker::from(&stimulus).0, 0x0101_0101_0032_0300);

        // A session start has neither block nor trial, only the type tells it apart.
        let session = LsLMarkerJson {
            block: 0,
            block_type: BlockType::Session,
            trial: 0,
            state: StateMarker::None,
            image_id: None,
            speed: SpeedModifier::None,
            data: None,
        };
        assert_eq!(LsLMarker::from(&session).0, 0x0005_0000_0000_0000);

        // Practice run, third trial, arousal rating of 7 on the sixth image of quadrant 1.
        let test_rating = LsLMarkerJson {
            block: 1,
            block_type: BlockType::Test,
            trial: 3,
            state: StateMarker::RatingArousal,
            image_id: Some(1 << 14 | 5),
            speed: SpeedModifier::VeryFast,
            data: Some(MarkerPayload::Rating(7)),
        };
        assert_eq!(LsLMarker::from(&test_rating).0, 0x0104_0306_4005_0507);
    }

    /// `speed` and `data` share the low 16 bits, a payload wider than a byte would run into
    /// the speed above it.
    #[test]
    fn speed_and_payload_do_not_overlap() {
        let marker = LsLMarkerJson {
            block: 1,
            block_type: BlockType::Calibration,
            trial: 1,
            state: StateMarker::None,
            image_id: None,
            speed: SpeedModifier::VerySlow,
            data: Some(MarkerPayload::CalibrationFlag(true)),
        };
        let packed = LsLMarker::from(&marker).0;
        assert_eq!((packed >> 8) & 0xFF, SpeedModifier::VerySlow as i64);
        assert_eq!(packed & 0xFF, 1);
    }

    /// The frontend sends the speed as a snake_case string, the marker stores the ordinal.
    #[test]
    fn speed_wire_names() {
        for (speed, name) in [
            (SpeedModifier::None, "none"),
            (SpeedModifier::VerySlow, "very_slow"),
            (SpeedModifier::Slow, "slow"),
            (SpeedModifier::Normal, "normal"),
            (SpeedModifier::Fast, "fast"),
            (SpeedModifier::VeryFast, "very_fast"),
        ] {
            let json = format!("\"{name}\"");
            assert_eq!(serde_json::to_string(&speed).unwrap(), json);
            assert_eq!(serde_json::from_str::<SpeedModifier>(&json).unwrap(), speed);
        }
    }

    /// The frontend sends the block type as a lowercase string, a rename here would silently
    /// break every marker it stamps.
    #[test]
    fn block_type_wire_names() {
        for (block_type, name) in [
            (BlockType::Calibration, "calibration"),
            (BlockType::Stimulus, "stimulus"),
            (BlockType::Neutral, "neutral"),
            (BlockType::Pause, "pause"),
            (BlockType::Test, "test"),
            (BlockType::Session, "session"),
        ] {
            let json = format!("\"{name}\"");
            assert_eq!(serde_json::to_string(&block_type).unwrap(), json);
            assert_eq!(
                serde_json::from_str::<BlockType>(&json).unwrap() as u8,
                block_type as u8
            );
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LsLMarkerJson {
    // 0 in non experiment contexts else 1..
    block: u8,
    // Identifies block type
    block_type: BlockType,
    // trial inside block 1..
    trial: u8,
    // state inside trial 0 if Calibration
    state: StateMarker,
    // Image Id if there it's a Stimulus trial else 0
    image_id: Option<u16>,
    // Walking condition of the trial, `None` wherever there is no walking
    #[serde(default)]
    speed: SpeedModifier,
    // data depending on the block_type in combination with state refer to it's doc
    data: Option<MarkerPayload>,
}

// The walking condition of a trial. Ordered slowest to fastest so the value can be read as an
// ordinal, `None` covers the markers that involve no walking at all: a pause, a session start
// and a calibration run.
#[derive(Serialize, Deserialize, Clone, Copy, Debug, Default, PartialEq)]
#[repr(u8)]
#[serde(rename_all = "snake_case")]
pub enum SpeedModifier {
    #[default]
    None = 0,
    VerySlow = 1,
    Slow = 2,
    Normal = 3,
    Fast = 4,
    VeryFast = 5,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug)]
#[repr(u8)]
pub enum StateMarker {
    // Special state for 'blocks' that have no state like calibration or pause
    None = 0,
    Baseline = 1,
    Stimulus = 2,
    Go = 3,
    RatingPrompt = 4,
    RatingValance = 5,
    RatingArousal = 6,
}

// All currently supported Block types. Calibration, Test and Session are not technically blocks
// but are included so we can tell those runs apart from real data.
#[derive(Serialize, Deserialize, Clone, Copy, Debug)]
#[repr(u8)]
#[serde(rename_all = "lowercase")]
pub enum BlockType {
    Calibration = 0, // Calibration data is a flag
    Stimulus = 1,    // Stimulus with Rating state is the respective rating
    Neutral = 2,     // never has data
    Pause = 3,       // never has data
    Test = 4,        // practice run opened from the instructions, never real data
    Session = 5,     // session start, carries neither block nor trial, never has data
}

// The marker payload (ignoring the tag since the block type implies the paylode type)
// may only ever be 8 bit or smaller, the upper half of its former 16 bit slot holds the speed.
#[derive(Serialize, Deserialize, Clone, Copy, Debug)]
pub enum MarkerPayload {
    Rating(u8),
    CalibrationFlag(bool),
}

impl MarkerPayload {
    fn data(&self) -> u8 {
        match self {
            MarkerPayload::Rating(r) => *r,
            MarkerPayload::CalibrationFlag(f) => *f as u8,
        }
    }
}

impl LsL {
    fn new(rx: Receiver<LsLMarker>) -> Result<Self, lsl::Error> {
        let info = lsl::StreamInfo::new(
            "App Events",
            "Markers",
            1,
            lsl::IRREGULAR_RATE,
            lsl::ChannelFormat::Int64,
            "",
        )?;

        Ok(Self {
            recv: rx,
            event_outlet: StreamOutlet::new(&info, 1, 360)?,
        })
    }

    fn start(&self) {
        loop {
            let e = self.recv.recv().unwrap();
            info!("Received Event: {e:?}");

            if let Err(e) = self.event_outlet.push_sample(&[e.0]) {
                error!("Error sending lsl packet: {e:?}");
            }
        }
    }
}

impl LsLManager {
    pub fn new() -> Self {
        let (tx, rx) = channel::<LsLMarker>();
        spawn(move || {
            let lsl = LsL::new(rx).unwrap();
            lsl.start();
        });
        Self { sender: tx }
    }

    pub fn publish_event(&self, event: LsLMarkerJson) -> anyhow::Result<()> {
        info!("Received Marker: {event:?}");
        let marker = LsLMarker::from(&event);
        self.sender.send(marker)?;
        Ok(())
    }
}
