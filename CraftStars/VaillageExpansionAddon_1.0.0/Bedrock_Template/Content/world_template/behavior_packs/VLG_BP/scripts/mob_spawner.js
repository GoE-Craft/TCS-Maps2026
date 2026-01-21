import { world, system, ItemStack, BlockPermutation } from '@minecraft/server';
import * as game from "./game";
import * as vector3 from "./vector3";

const airBlock = BlockPermutation.resolve("air");



export async function onTick() {
	let allMobSpawners = await game.getEntities("tcs_vlg:mob_spawner");
	if (allMobSpawners === undefined)
		return;
	for(let mobSpawner of allMobSpawners)
	{
		if (mobSpawner === undefined)
			continue;
		try {
			let players = await game.getPlayersInRange(mobSpawner.dimension, mobSpawner.location, 0, 30);
			if (players === undefined || players.length == 0)
				continue;
			await spawnMobs(mobSpawner);

		} catch(error) { } 
	}
}

export async function countSpawners(mobSpawner, mobId)
{
	if (mobId === undefined)
		return;

	let spawners = await game.getEntitiesInRange("tcs_vlg:mob_spawner", mobSpawner.dimension, mobSpawner.location, 0, 7);
	if (spawners === undefined || spawners.length == 0)
		return 0;

	let spawnerCount = 0;
	for (let spawner of spawners)
	{
		let spawnerMobId = await spawner.getDynamicProperty("tcs_vlg_mob");
		if (mobId === spawnerMobId)
			spawnerCount++;
	}
	return spawnerCount;
}

export async function spawnMobs(mobSpawner)
{
	let lastSpawnTime = await game.loadEntityParam(mobSpawner, "tcs_vlg_last_spawn_time", -1);
	let refreshTimer = await game.loadEntityParam(mobSpawner, "tcs_vlg_refresh_timer", 0);
	let mobId = await mobSpawner.getDynamicProperty("tcs_vlg_mob");
	if (mobId === undefined)
		return;

	// one-time spwan -> spawn and remove spawner
	if (refreshTimer == 0)
	{
		await mobSpawner.dimension.spawnEntity(mobId, mobSpawner.location);
		await mobSpawner.triggerEvent("tcs_vlg:remove");
		return;
	}

	if (system.currentTick < refreshTimer + lastSpawnTime)
		return;

	mobSpawner.setDynamicProperty("tcs_vlg_last_spawn_time", system.currentTick);
	let spawnerCount = await countSpawners(mobSpawner, mobId);
	let mobs = await game.getEntitiesInRange(mobId, mobSpawner.dimension, mobSpawner.location, 0, 5);
	let spawnLocation = vector3.Down.add(mobSpawner.location);
	if (mobs === undefined || mobs.length < spawnerCount)
		await mobSpawner.dimension.spawnEntity(mobId, spawnLocation);
	mobSpawner.setDynamicProperty("tcs_vlg_last_spawn_time", system.currentTick);

}

export async function onScriptEventReceive(event) 
{
	if (event.id === "tcs_vlg:mob_spawner_load")
	{
		let mobId = event.message;
		//if (mobId === "drowned")
		//	mobId = "tcs_vlg:drowned";
		event.sourceEntity.setDynamicProperty("tcs_vlg_mob", mobId);
		event.sourceEntity.setDynamicProperty("tcs_vlg_refresh_timer", 1200);
		let commandBlockLocation = vector3.Down.add(event.sourceEntity.location);
			
		event.sourceEntity.dimension.setBlockPermutation(commandBlockLocation, airBlock);
	}
}
export async function removeEntity(mobSpawner)
{
	mobSpawner.triggerEvent("tcs_vlg:remove");
}