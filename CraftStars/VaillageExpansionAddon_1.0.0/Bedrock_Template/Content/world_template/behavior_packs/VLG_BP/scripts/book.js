import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";


export async function onItemUse(event) {
	const player = event.source;
	showWelcomePage(player);
	player.playSound("tcs_vlg:book_open");
}


async function showWelcomePage(player) {
	const form = new ActionFormData()
		.title("§l§1Village Expansion Guide Book§r")
		.body("")
		.button("§l§sAbout§r", "textures/tcs/vlg/ui/info")
		.button("§l§sAbout§r", "textures/tcs/vlg/ui/block")
		.button("§l§sAbout§r", "textures/tcs/vlg/ui/villager")
		.button("§l§sAbout§r", "textures/tcs/vlg/ui/iron_golem")
		.button("§l§sAbout§r", "textures/tcs/vlg/ui/evil_golem")
		.button("§l§sAbout§r", "textures/tcs/vlg/ui/achievements");

	form.show(player).then((response) => {
		if (response.canceled) {
			return;
		}
		switch (response.selection) {
			case 0:
				showAboutPage(player);
				break;
			case 1:	
				showAboutPage(player);
				break;
			case 2:
				showAboutPage(player);
				break;
			case 3:
				showAboutPage(player);
				break;
			case 4:
				showAboutPage(player);
				break;
			case 5:
				showAboutPage(player);
				break;
		}
	});
}



async function showAboutPage(player) {
	const form = new ActionFormData()
		.title("§lAbout Combine Weapons§r")
		.body(
			"§6§lVillage Expansion Add-On§r lets you craft powerful new gear!\n\n" +
			"§9§lPowerful weapons§r, §l§aunique tools§r, §l§6upgraded armor sets§r andventure.\n\n"
			
		)
		.button("§l§qBack§r", "textures/tcs/vlg/ui/back");
	form.show(player).then((response) => {
		if (response.canceled) {
			return;
		}
		showWelcomePage(player);
	});
}
