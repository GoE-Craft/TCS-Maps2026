import { world, system, TimeOfDay } from "@minecraft/server";
import * as Vector3 from "./vector3";


let scoreboard = world.scoreboard;
export const overworld = world.getDimension('overworld');
export const nether = world.getDimension('nether');
export const the_end = world.getDimension('the_end');
export const dimensions = [overworld, nether, the_end];

export let host = undefined;


export function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1))+min;
}

export async function waitForTicks(ticks) {
    return await system.runTimeout(stam, ticks);
}

export async function waitForLoopEvent(ticks, callback) {
    return new Promise(resolve => {
        let id = 0;
        const event = async function () {
            var _a;
            if (await callback()) {
                resolve();
            }
            else {
                id = system.runTimeout(event, ticks);
            }
        };
        system.run(event);
    });
}

export async function loadHost() {
	if (host)
		return;
	
	await waitForLoopEvent(1, () => {
		return world.getAllPlayers().length > 0;
	});
	host = await world.getAllPlayers()[0];
	if (!host.hasTag("tcs_cct_isHost"))
		host.addTag("tcs_cct_isHost");
}



// This function replaces the old initBedrock function
export async function onLoadFirstTime()
{
	// If needed - initialize scoreboard function, if not - comment this
	//await runCommand("function tcs/cct/params/create_objectives");
	//await runCommand("function tcs/cct/params/set_scores");
}


export async function runCommand(command) {
	return await overworld.runCommandAsync(command);
}

export async function runHostCommand(command) {
	return await host.runCommandAsync(command);
}

export async function runPlayerCommand(entity, command) {
	return await entity.runCommandAsync(command);
}
export async function runDelayedPlayerCommand(delay, entity, command) {
	return await system.runTimeout(() => { runPlayerCommand(entity, command); }, delay);
}
export async function runMobCommand(entity, command) {
	return await entity.runCommandAsync(command);
}

export async function getAllMobs()
{
	let entities = await dimensions.flatMap((dim) => (dim.getEntities()));
	entities = entities.filter( (entity) =>  entity.typeId !== "minecraft:player");
	return entities;
}
export async function getEntity(entityType)
{
	const entities = await dimensions.flatMap((dim) => (dim.getEntities({ type: entityType })));
	if (entities !== undefined && entities.length > 0)
		return entities[0];
	return undefined;
}
export async function getEntities(entityType)
{
	const entities = await dimensions.flatMap((dim) => (dim.getEntities({ type: entityType })));
	return entities;
}
export async function getAllEntitiesWithTags(entityTags)
{
	const entities = await dimensions.flatMap((dim) => (dim.getEntities({ tags: entityTags })));
	return entities;
}
export async function getEntitiesWithTags(entityType, entityTags)
{
	const entities = await dimensions.flatMap((dim) => (dim.getEntities({ type: entityType, tags: entityTags })));
	return entities;
}
export async function getEntityNearEntity(entityType, nearbyEntity)
{
	const entities = await nearbyEntity.dimension.getEntities( { type: entityType, location: nearbyEntity.location, closest: 1 } );
	return entities;
}
export async function getEntityInLocation(entityType, dim, centerLocation)
{
	const entities = await dim.getEntities( { type: entityType, location: centerLocation, closest: 1 } );
	return entities[0];
}
export async function getPlayerInLocation(dim, centerLocation)
{
	const players = await dim.getPlayers( { location: centerLocation, closest: 1 } );
	return players;
}
export async function getPlayersInRange(dim, centerLocation, minDist, maxDist)
{
	const players = await dim.getPlayers( { location: centerLocation, minDistance: minDist, maxDistance: maxDist } );
	return players;
}
export async function getPlayersWithTags(playerTags)
{
	const players = await dimensions.flatMap((dim) => (dim.getPlayers({ tags: playerTags })));
	return players;
}
export async function getEntitiesInRange(entityType, dim, centerLocation, minDist, maxDist)
{
	const entities = await dim.getEntities( { type: entityType, location: centerLocation, minDistance: minDist, maxDistance: maxDist } );
	return entities;
}

export async function getEntityInBox(entityType, dim, corner1, corner2)
{
	let entities = await getEntitiesInArea(entityType, dim, corner1, corner2, "xyz")
	if (entities !== undefined && entities.length > 0)
		return entities[0];
	return undefined;
}
export async function getEntitiesInArea(entityType, dim, corner1, corner2, checkDimensions, tag)
{
	// checkDimensions - what dimensions to check - "x", "xz", "xyz", etc
	let entities = await dim.getEntities( { type: entityType } );
	if (tag !== undefined)
		entities = entities.filter( (entity) =>  entity.hasTag(tag));
	return entities.filter( (entity) =>  Vector3.locationIsInArea(entity.location, corner1, corner2, checkDimensions));
}
export async function getPlayersInArea(dim, corner1, corner2, checkDimensions, tag)
{
	// checkDimensions - what dimensions to check - "x", "xz", "xyz", etc
	let players = await dim.getPlayers();
	if (tag !== undefined)
		players = players.filter( (player) =>  player.hasTag(tag));
	return players.filter( (player) =>  Vector3.locationIsInArea(player.location, corner1, corner2, checkDimensions));
}

export async function getAllEntitiesInRange(dim, centerLocation, minDist, maxDist)
{
	const entities = await dim.getEntities( { location: centerLocation, minDistance: minDist, maxDistance: maxDist } );
	return entities;
}

const DEFAULT_MESSAGE_COOLDOWN = 3; // Cooldown time in ticks

// Add cooldown (in seconds) to stop K/D actionbar overriding message
export async function setMessageCooldown(player, cooldown = 20) {
	world.setDynamicProperty("tcs_cct_message_cooldown", cooldown);
}

export async function showPlayerErrorMessage(player, message)
{
	await setMessageCooldown(player, DEFAULT_MESSAGE_COOLDOWN);
	if (player !== undefined)
	{
		await runPlayerCommand(player, "title @s actionbar "+message);
		await player.playSound("tcs_cct:error", { volume: 0.8 } );
	}
	else
	{
		await runCommand("title @a actionbar "+message);
		await runCommand("playsound tcs_cct:error @a ~ ~ ~ 100 1 0.8");
	}
}

export async function showPlayerInfoMessage(player, message)
{
	await setMessageCooldown(player, DEFAULT_MESSAGE_COOLDOWN);
	if (player !== undefined)
	{
		await runPlayerCommand(player, "title @s actionbar "+message);
		await player.playSound("tcs_cct:info", { volume: 0.8 } );
	}
	else
	{
		await runCommand("title @a actionbar "+message);
		await runCommand("playsound tcs_cct:info @a ~ ~ ~ 100 1 0.8");
	}
}

export async function tellraw(entity, target, msg) {
	return await entity.runCommandAsync(`tellraw ${target} {"rawtext":[{"text":"§r${msg}"}]}`);
}

export async function title(entity, target, msg) {
	//await setMessageCooldown(player, DEFAULT_MESSAGE_COOLDOWN);
	await runPlayerCommand(entity, `title ${target} times 20 60 20`);
	return await entity.runCommandAsync(`titleraw ${target} title {"rawtext":[{"text":"§r${msg}"}]}`);
}
export async function subtitle(entity, target, msg, addEmptyTitle=false) {
	//await setMessageCooldown(player, DEFAULT_MESSAGE_COOLDOWN);
	await runPlayerCommand(entity, `title ${target} times 20 60 20`);
	await entity.runCommandAsync(`title ${target} subtitle ${msg}`);
	if (addEmptyTitle === true)
		await entity.runCommandAsync(`title ${target} title `);
}
export async function actionbar(entity, target, msg) {
	//await setMessageCooldown(player, DEFAULT_MESSAGE_COOLDOWN);
	await runPlayerCommand(entity, `title ${target} times 20 60 20`);
	return await entity.runCommandAsync(`titleraw ${target} actionbar {"rawtext":[{"text":"§r${msg}"}]}`);
}
export async function titleFull(entity, target, titleMsg, subtitleMsg, actionbarMsg) {
	if (subtitleMsg === undefined)
		subtitleMsg = "§r";
	if (titleMsg === undefined)
		titleMsg = "§r";
	
	//await setMessageCooldown(player, DEFAULT_MESSAGE_COOLDOWN);
	await runPlayerCommand(entity, `title ${target} times 20 60 20`);
	if (actionbarMsg !== undefined)
		await entity.runCommandAsync(`title ${target} actionbar ${actionbarMsg}`);
	await entity.runCommandAsync(`title ${target} title ${titleMsg}`);
	await entity.runCommandAsync(`title ${target} subtitle ${subtitleMsg}`);
}

export async function playSound(entity, target, playSound, volume, pitch, minVolume) {
	let soundVolume = volume ? volume : 100;
	let soundPitch = pitch ? pitch : 1;
	let soundMinVolume = minVolume ? minVolume : 1;
	return await entity.runCommandAsync(`playsound ${playSound} ${target} ~ ~ ~ ${soundVolume} ${soundPitch} ${soundMinVolume}`);
}

export async function loadWorldParam(name, defaultValue)
{
	let param = await world.getDynamicProperty(name);
	if (param === undefined)
	{
		param = defaultValue;
		await world.setDynamicProperty(name, param);
	}
	return param
}
export async function loadEntityParam(entity, name, defaultValue)
{
	let param = await entity.getDynamicProperty(name);
	if (param === undefined)
	{
		param = defaultValue;
		await entity.setDynamicProperty(name, param);
	}
	return param;
}
export async function advanceWorldParam(name)
{
	let param = await world.getDynamicProperty(name);
	param = (param === undefined) ? 1 : param+1;
	await world.setDynamicProperty(name, param);
	return param;
}
export async function advanceEntityParam(entity, name)
{
	let param = await entity.getDynamicProperty(name);
	param = (param === undefined) ? 1 : param+1;
	await entity.setDynamicProperty(name, param);
	return param;
}

export function debug(message) {
	return world.sendMessage(message);
}

export function debugError(message) {
	return world.sendMessage("§4" + message);
}

export async function verifyAir2(corner1, corner2)
{
	for (let x=corner1.x; x<=corner2.x; x++)
	{
		for (let y=corner1.y; y<=corner2.y; y++)
		{
			for (let z=corner1.z; z<=corner2.z; z++)
			{
				let block = await overworld.getBlock({x: x, y: y, z: z});
				if (!isBlockAir(block))
					return false;
			}
		}
	}
	return true;
}
const ignoreBlocks = [ 'air', 'light_block', 'white_carpet', 'orange_carpet', 'magenta_carpet',
	'light_blue_carpet', 'yellow_carpet', 'lime_carpet', 'pink_carpet', 'gray_carpet', 'light_gray_carpet',
	'cyan_carpet', 'purple_carpet', 'blue_carpet', 'brown_carpet','green_carpet', 'red_carpet', 'black_carpet',
	'grass', 'short_grass', 'tall_grass', 'blue_orchid', 'allium', 'azure_bluet', 'red_tulip', 'orange_tulip', 'white_tulip',
	'pink_tulip', 'oxeye_daisy', 'cornflower', 'lily_of_the_valley', 'wither_rose', 'fern', 'large_fern','snow_layer', 'dandelion',
	'poppy', 'allium', 'sunflower', 'lilac', 'rose_bush', 'peony', 'brown_mushroom' ];

export function isBlockAir(block)
{
	if (block === null || block === undefined || block.isAir == undefined || block.isAir) 
		return true;
	if (ignoreBlocks.includes(block.typeId.replace("minecraft:","")))
		return true;
	return false;
}

export async function setWorldWeather(weather) {
    if (weather === "clear") await runCommand("weather clear");
    else if (weather === "rain") await runCommand("weather rain");
    else if (weather === "thunder") await runCommand("weather thunder");
}

export function getItemInHand(player) {
	const playerInventory = player.getComponent("minecraft:inventory").container;
	const itemInHand = playerInventory.getItem(player.selectedSlotIndex);
	return itemInHand;
}

export function getItemInOffHand(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const itemInOffHand = equippable.getEquipment("Offhand");
    return itemInOffHand;
}