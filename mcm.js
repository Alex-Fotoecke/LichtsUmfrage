/* global AppContent, KnuddelsServer, appInfo, botUser, Moderators, nono, cmehren */

function mcmmail(user, params, command) { 
	if (!user.isChannelModerator()) {
		user.sendPrivateMessage('Du hast keine Berechtigung für diese Funktion.');
		return;
	}
	if (params.length == 0) {
		user.sendPrivateMessage('Du musst auch einen Text angeben');
	} else {
		var text = 'Eine °BB°_Channelmail_°r° ist von °BB°_' + user.getNick() + '_°r° eingetroffen °#°°#° Inhalt der °BB°_Channelmail_°r° ist: °#°°#°°#° ' + params
		var Moderators = KnuddelsServer.getChannel().getChannelConfiguration().getChannelRights().getChannelModerators();
		for (var i = 0; i < Moderators.length; i++) {
			var Moderator = Moderators[i];
			var res = text.replace("$TONICK", Moderator.getProfileLink());
			Moderator.sendPostMessage('Channelmail von ' + user.getNick(), res);
		}
		user.sendPrivateMessage('Rundmail wurde erfolgreich verschickt.');
	}
};

function feedbackApp(user, params) {
	var channelowners = KnuddelsServer.getChannel().getChannelConfiguration().getChannelRights().getChannelOwners();
	for (var i = 0; i < channelowners.length; i++) {
		var ChannelOwner = channelowners[i];
		var text = 'Ein Feedback ist von ' + user.getNick() + ' eingetroffen °#° Inhalt des Feedbacks ist: °#°°#° ' + params.escapeKCode();
		ChannelOwner.sendPostMessage('Feedback von ' + user.getNick(), text);
	}
	user.sendPrivateMessage('Dein Feedback wurde abgeschickt!');
};

function changelogapp(user, command, params) { 
    var pageData = {
        version: appInfo.getAppVersion()
    };
    var htmlFile = new HTMLFile('changelog.html', pageData); 
    var popupContent = AppContent.popupContent(htmlFile, 400, 800); 
    user.sendAppContent(popupContent);
};

function u(user, params, command) {
	if (user.isAppManager()) {
		var appAccess = KnuddelsServer.getAppAccess();
		var rootInstance = appAccess.getOwnInstance().getRootInstance();
		rootInstance.updateApp();

		user.sendPrivateMessage('Ich habe soeben ein Update angestoßen.');
	}
};

function mcmBefehle(user, params, command) {
	var htmlFile = new HTMLFile('mcmbefehle.html');
	var popupContent = AppContent.popupContent(htmlFile, 400, 800);
	user.sendAppContent(popupContent);
	user.sendPrivateMessage('Es wurde so eben das mcmBefehle PoPUp geöffnet');
};

function impressum(user, params, command) {
	var htmlFile = new HTMLFile('impressum.html');
	var popupContent = AppContent.popupContent(htmlFile, 400, 800);
	user.sendAppContent(popupContent);
	user.sendPrivateMessage('Es wurde so eben das Impressum geöffnet');
};

function uvote(user, params, command) {
	if (aktuelleUmfrage == null) { //Erstmal schauen ob überhaupt eine Umfrage läuft
		user.sendPrivateMessage("Die Umfrage ist vorbei."); //Umfrage beendet User bekommt hinweis!
		return;
	}

	if (typeof aktuelleUmfrage.teilnehmer[user.getUserId()] != 'undefined') { //Dann ob der User bereits in der Teilnehmerliste ist
		user.sendPrivateMessage("Du hast bereits abgestimmt.");
		return;
	}


	aktuelleUmfrage.votes[params]++;
	aktuelleUmfrage.teilnehmer[user.getUserId()] = true;

	user.sendPrivateMessage("Danke für deine Teilnahme bei meiner Umfrage. Du hast für '" + aktuelleUmfrage.antworten[params] + "' gestimmt.")
};

function lvote(user, params, command) {
	var parts = params.split(" ");
	var umfrage = null;
	for (var i in langzeitUmfragen) {
		if (langzeitUmfragen[i].id == parts[0]) {
			umfrage = langzeitUmfragen[i];
			break;
		}
	}

	if (umfrage == null) {
		user.sendPrivateMessage("Die Umfrage ist vorbei.");
		return;
	}

	if (typeof umfrage.teilnehmer[user.getUserId()] != 'undefined') { //Dann ob der User bereits in der Teilnehmerliste ist
		user.sendPrivateMessage("Du hast bereits abgestimmt.");
		return;
	}


	umfrage.votes[parts[1]]++;
	umfrage.teilnehmer[user.getUserId()] = true;

	user.sendPrivateMessage("Danke für deine Teilnahme bei meiner Umfrage. Du hast für '" + umfrage.antworten[parts[1]] + "' gestimmt.")
};

function showUmfrage(user, umfrage) {
 
    var message = '°#°°>CENTER<°°BB°°20°_Channelumfrage_ °r°' + umfrage.ersteller.getNick() + '! ' + umfrage.frage + ' ?°#°'
 
    for (var i = 0; i < umfrage.antworten.length; i++) {
        message += '°>{button}' + umfrage.antworten[i] + ' ||call|/lvote ' + umfrage.id + ' ' + i + '<° ';
    }
 
    message += '°#°°#°Die Langzeitumfrage läuft bis ' + formatTime(new Date(umfrage.ende)) + '°##°°>LEFT<°';
 
    user.sendPrivateMessage(message);
}

function lumfragen(user, params, command) {
	for (var i in langzeitUmfragen) {
		if (typeof langzeitUmfragen[i].teilnehmer[user.getUserId()] == 'undefined') { //Dann ob der User bereits in der Teilnehmerliste ist
			showUmfrage(user, langzeitUmfragen[i]);
		}
	}
};


function history(user, params, command) {
	if (!user.isChannelModerator()) {
		user.sendPrivateMessage('Du hast keine Berechtigung für diese Funktion.');
		return;
	} else {
		var countTo = 0;
		if (params.length != 0 && !isNaN(parseFloat(params)) && isFinite(params)) {
			countTo = vergangeneUmfragen.length - parseInt(params);
			if (countTo < 0)
				countTo = 0;
		}
		for (var i = vergangeneUmfragen.length - 1; i >= countTo; i--) {
			var umfrage = vergangeneUmfragen[i];
			if (typeof umfrage.createdAt != 'undefined')
				var str = "Die Umfrage '" + umfrage.id + ' - ' + umfrage.frage + "' von " + umfrage.ersteller.getProfileLink() + " erstellt am " + umfrage.createdAt + ": ";
			else
				var str = "Umfrage '" + umfrage.frage + "' von " + umfrage.ersteller.getProfileLink() + ": ";


			for (var j = 0; j < umfrage.antworten.length; j++) {
				str += "'" + umfrage.antworten[j] + "' (" + umfrage.votes[j] + "), ";
			}
			var pageData= {
				history : vergangeneUmfragen = []
			};
			user.sendPrivateMessage('Klick kommt an')
			var htmlFile = new HTMLFile('history.html', pageData);
			var popupContent = AppContent.popupContent(htmlFile);
			user.sendAppContent(popupContent);
			//botUser.sendPostMessage(' History Umfrage Tool, aktuell ', str);//
			//user.sendPrivateMessage(str);//
		}
	}

}

function vmcm(user, params, command) {
	if (user.isChannelOwner()===true) {
	var ua = KnuddelsServer.getUserAccess();
	if (ua.exists(params)) {
		var id = ua.getUserId(params);
		if (vmcms.indexOf(id) == -1) {
			vmcms.push(id);
		}

		if (ua.mayAccess(id)) {
			var user = ua.getUserById(id);
			if (user.isOnlineInChannel()) {
				user.addNicklistIcon(vmcm_icon, 35);
			}
		}
	}
	user.sendPrivateMessage('VMCM wurde vergeben');
}
else
 user.sendPrivateMessage ('Du bist nicht berechtigt, diese funktion ist für den Channelinhaber.°#°Erstelle doch einen eigene Channel -> °BB>MyChannel erstellen|/mychannel<°°° und nutze diesen Befehl dann!');
}
function dvmcm (user, params, command) {
	if (user.isChannelOwner()===true) {
		var ua = KnuddelsServer.getUserAccess();
		if (ua.exists(params)) {
			var id = ua.getUserId(params);
			var index = vmcms.indexOf(id);
			if (vmcms.indexOf(id) > -1) {
				var user = ua.getUserById(id);
				user.removeNicklistIcon(vmcm_icon);
			}
		}
		user.sendPrivateMessage('VMCM wurde entzogen');
	}
else 
user.sendPrivateMessage ('Du bist nicht berechtigt, diese funktion ist für den Channelinhaber.°#°Erstelle doch einen eigene Channel -> °BB>MyChannel erstellen|/mychannel<°°° und nutze diesen Befehl dann!');
}
function banApp (user, params, command) {
	if (user.isChannelModerator()===true) {
	var ua = KnuddelsServer.getUserAccess();
	if (ua.exists(params)) {
		var id = ua.getUserId(params);
		if (ban.indexOf(id) == -1) {
			ban.push(id);
		}

		if (ua.mayAccess(id)) {
			var user = ua.getUserById(id);
			if (user.isOnlineInChannel()) {
				user.sendPrivateMessage('Du wurdest aus diesem Channel gebannt')
			}
		}
	}
	user.sendPrivateMessage('Benutzer gebannt');
}
else
 user.sendPrivateMessage ('Du bist nicht berechtigt, diese funktion ist für den Channelinhaber.°#°Erstelle doch einen eigene Channel -> °BB>MyChannel erstellen|/mychannel<°°° und nutze diesen Befehl dann!');
}
function ubanApp (user, params, command) {
	if (user.isChannelOwner()===true) {
		var ua = KnuddelsServer.getUserAccess();
		if (ua.exists(params)) {
			var id = ua.getUserId(params);
			var index = ban.indexOf(id);
			if (index > -1) {
				var user = ua.getUserById(id);
				ban.splice(index, 1);	
			}
		}
		user.sendPrivateMessage('Benutzer wurde entbannt');
	}
else 
user.sendPrivateMessage ('Du bist nicht berechtigt, diese funktion ist für den Channelinhaber.°#°Erstelle doch einen eigene Channel -> °BB>MyChannel erstellen|/mychannel<°°° und nutze diesen Befehl dann!');
}
