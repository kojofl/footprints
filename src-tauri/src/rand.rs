use rand::{rng, Rng};
use std::{
    f64::EPSILON,
    fmt::Debug,
    mem::{self, MaybeUninit},
};

#[derive(Debug, Clone, Copy)]
struct Container {
    value: usize,
    thresh: f64,
}

pub struct Alias<const S: usize> {
    containers: [Container; S],
}

impl<const S: usize> Debug for Alias<S> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Alias")
            .field("containers", &self.containers)
            .finish()
    }
}

#[derive(Debug)]
struct AliasBuilder<const S: usize> {
    small: StackVec<S>,
    big: StackVec<S>,
}

impl<const S: usize> AliasBuilder<S> {
    pub fn new(dist: &[f64; S]) -> Self {
        let mut small = StackVec::new();
        let mut big = StackVec::new();

        for (i, v) in dist.iter().enumerate() {
            let new_val = v * dist.len() as f64;
            if new_val <= 1.0 {
                small.push(new_val, i);
            } else {
                big.push(new_val, i);
            }
        }

        Self { small, big }
    }

    pub fn build(mut self) -> [Container; S] {
        let mut containers = [MaybeUninit::<Container>::uninit(); S];
        while let Some((thresh, pos)) = self.small.pop() {
            let rest = 1.0 - thresh;
            if rest > EPSILON {
                let (mut p, i) = self.big.pop().expect("large counterpart");
                containers[pos] = MaybeUninit::new(Container { value: i, thresh });
                p -= rest;
                if p > 1.0 {
                    self.big.push(p, i);
                } else {
                    self.small.push(p, i);
                }
            } else {
                containers[pos] = MaybeUninit::new(Container {
                    value: pos,
                    thresh: 1.0,
                });
            }
        }
        while let Some((_, value)) = self.big.pop() {
            containers[value] = MaybeUninit::new(Container { value, thresh: 1.0 });
        }
        unsafe { mem::transmute_copy::<_, [Container; S]>(&containers) }
    }
}

impl<const S: usize> Alias<S> {
    pub fn new(dist: &[f64; S]) -> Self {
        assert!(1.0 - dist.iter().sum::<f64>() < EPSILON);
        let builder = AliasBuilder::new(dist);
        println!("{:?}", builder);

        Self {
            containers: builder.build(),
        }
    }

    pub fn generate(&self) -> usize {
        let p: f64 = rng().random_range(0.0..1.0) * self.containers.len() as f64;
        let idx = p.floor() as usize;
        if self.containers[idx].thresh <= p - idx as f64 {
            self.containers[idx].value
        } else {
            idx
        }
    }
}

pub struct StackVec<const S: usize> {
    inner: [MaybeUninit<(f64, usize)>; S],
    len: usize,
}

impl<const S: usize> Debug for StackVec<S> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let slice: &[(f64, usize)] =
            unsafe { std::slice::from_raw_parts(self.inner[0].as_ptr(), self.len) };
        f.debug_struct("StackVec").field("inner", &slice).finish()
    }
}

impl<const S: usize> StackVec<S> {
    pub fn new() -> Self {
        Self {
            inner: [MaybeUninit::uninit(); S],
            len: 0,
        }
    }

    pub fn push(&mut self, v: f64, i: usize) {
        assert!(self.len < self.inner.len());
        self.inner[self.len] = MaybeUninit::new((v, i));
        self.len += 1;
    }

    pub fn pop(&mut self) -> Option<(f64, usize)> {
        if self.len == 0 {
            return None;
        }
        let x = unsafe { self.inner[self.len - 1].assume_init_read() };
        self.len -= 1;
        Some(x)
    }
}
