import { system, world, ItemStack } from "@minecraft/server";
import * as game from "./game";
import * as game_features from "./game_features";

let scoreboard = world.scoreboard;

let onLoadDone = false;
let onLoadFirstTimeStarted = false;
let onLoadFirstTimeFinished = false;
let onLoadFirstFinishTick = -100;
let nextIntervalTick = -100;

async function mainLoop() 
{
	if (system.currentTick == onLoadFirstFinishTick+20)
	{
		await game.host.addTag("onLoadFirstTimeFinished");
	}
	
	if (!onLoadDone)
		await onLoad();
	else
		await onTick();
	
	system.run(mainLoop);
}
        

// This function runs once per world, on the frist session
async function onLoadFirstTime() 
{
	onLoadFirstTimeStarted = true;
	let firstLoadFinished = scoreboard.getObjective("tcs_cct_FirstLoadFinished");
	if (firstLoadFinished)
		return;
	
  
	await game.onLoadFirstTime(); // this function replaces the old init_bedrock function
	
	firstLoadFinished = await scoreboard.addObjective("tcs_cct_FirstLoadFinished", "tcs_cct_FirstLoadFinished");
	onLoadFirstFinishTick = system.currentTick;
}

// This function runs once per session
// Add onLoad() and subscribes here. Don't make other changes to this function
async function onLoad() 
{
	if (onLoadDone)
		return;
	onLoadDone = true;

	// Moved this line from below position here because intro message wont work in other way.
	world.afterEvents.playerSpawn.subscribe(game_features.onPlayerSpawn);

	world.setDynamicProperty("tcs_cct_command_block_output", world.gameRules.commandBlockOutput);
	
	await game.loadHost();
	
	if (!onLoadFirstTimeStarted)
		await onLoadFirstTime() ;
	
	// initialize modules
	await game_features.onLoad();
	
	// Subscribe to events here
	world.afterEvents.entityLoad.subscribe(game_features.onEntityLoad);
	// world.afterEvents.playerSpawn.subscribe(game_features.onPlayerSpawn);
	world.afterEvents.entitySpawn.subscribe(game_features.onEntitySpawn);
	world.afterEvents.entityHealthChanged.subscribe(game_features.onEntityHealthChanged);
	world.afterEvents.entityHurt.subscribe(game_features.onEntityHurt);
	world.afterEvents.entityHitEntity.subscribe(game_features.onEntityHitEntity);
	world.afterEvents.entityDie.subscribe(game_features.onEntityDie);
	world.afterEvents.itemUse.subscribe(game_features.onItemUse);
	world.afterEvents.itemStartUse.subscribe(game_features.onItemStartUse);
	world.afterEvents.itemStopUse.subscribe(game_features.onItemStopUse);
	world.afterEvents.itemUseOn.subscribe(game_features.onItemUseOn);
	world.afterEvents.entityHitBlock.subscribe(game_features.onEntityHitBlock);
	world.afterEvents.playerBreakBlock.subscribe(game_features.onPlayerBreakBlock);
	system.afterEvents.scriptEventReceive.subscribe(game_features.onScriptEventReceive);
	world.beforeEvents.playerInteractWithEntity.subscribe(game_features.onPlayerInteractWithEntity);
	world.afterEvents.playerButtonInput.subscribe(game_features.onPlayerButtonInput);
	world.afterEvents.playerPlaceBlock.subscribe(game_features.onPlayerPlaceBlock);
	world.afterEvents.entityRemove.subscribe(game_features.onEntityRemoveAfterEvent);
	world.afterEvents.playerJoin.subscribe(game_features.onPlayerJoin);
	world.afterEvents.playerInteractWithBlock.subscribe(game_features.onPlayerInteractWithBlock);
}

// This function runs every tick (after load finished). Call main game loop and other code from here
async function onTick()
{
	await game_features.onTick(); 
	
	for(let player of world.getAllPlayers()) 
	{
		if (player === undefined)
			continue;
		if(!player.hasTag("tcs_vlg_starterkit")) {
			player.addTag("tcs_vlg_starterkit");
			// We do not need this anymore since intro messages are run via onPlayerSpawnAfterEventSignal
			// game.runPlayerCommand(player, `village load welcome_intro ~ ~ ~`);
			// game.runPlayerCommand(player, `village load welcome_book ~ ~ ~`);
		}
	}
}

system.run(mainLoop);