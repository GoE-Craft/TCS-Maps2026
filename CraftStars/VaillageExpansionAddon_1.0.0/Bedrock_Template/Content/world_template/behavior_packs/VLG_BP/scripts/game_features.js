import { world, system, EquipmentSlot } from "@minecraft/server";
import * as game from "./game";
import * as book from "./book";
import * as intro from "./intro";
import * as village from "./village";
import * as mob_spawner from "./mob_spawner";

export async function onLoad() {
}

export async function onTick() {
    await intro.onTick();
    await village.onTick();
    await mob_spawner.onTick();
}

export async function onEntityLoad(event) {}

export async function onPlayerSpawn(event) {
    await intro.onPlayerSpawn(event);
}

export async function onPlayerJoin(event) {}

export async function onEntitySpawn(event) {}

export async function onEntityHealthChanged(event) {}

export async function onEntityHurt(event) {
}

export async function onEntityHitEntity(event) {
}

export async function onEntityDie(event) {
}

export async function onItemUse(event) {
    const item = event.itemStack.typeId;

    if (item == "tcs_vlg:intro") intro.onItemUse(event);
    if (item == "tcs_vlg:book") book.onItemUse(event);
}

export async function onItemStartUse(event) {}

export async function onItemStopUse(event) {}

export async function onItemUseOn(event) {
}

export async function onEntityHitBlock(event) {}

export async function onPlayerBreakBlock(event) {
}

export async function onPlayerInteractWithEntity(event) {}

export async function onScriptEventReceive(event) {
    if (event.id === "tcs_vlg:village_load")
    	village.onScriptEventReceive(event);
    if (event.id === "tcs_vlg:mob_spawner_load")
    	mob_spawner.onScriptEventReceive(event);

}

export async function onPlayerButtonInput(event) {
}

export async function onPlayerPlaceBlock(event) {
}

export async function onEntityRemoveAfterEvent(event) {
}

export async function onPlayerInteractWithBlock(event) {
}