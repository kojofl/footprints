import { PersistedState } from "runed";

export const mode: PersistedState<"light" | "dark"> = new PersistedState("mode", localStorage.getItem("mode") === "dark" ? "dark" : "light");
