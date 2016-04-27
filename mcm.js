/* global AppContent, KnuddelsServer, appInfo, botUser, Moderators, nono, cmehren */

function mcmmail(user, params, command) {
	if(!user.isChannelModerator()) {
		user.sendPrivateMessage('Du hast keine Berichtigung für diese Funktion.');
		return;
	}	
	if(params.length == 0) {			
		user.sendPrivateMessage('Du musst auch einen Text angeben');
	} 
	else {	
		var text = 'Eine °BB°_Channelmail_°r° ist von °BB°_'+ user.getNick() + '_°r° eingetroffen °#°°#° Inhalt der °BB°_Channelmail_°r° ist: °#°°#°°#° '+ params
		var Moderators = KnuddelsServer.getChannel().getChannelConfiguration().getChannelRights().getChannelModerators();
		for (var i = 0; i < Moderators.length; i++) {
		var Moderator = Moderators[i];
		Moderator.sendPostMessage('Channelmail von '+ user.getNick() , text);
	}
		user.sendPrivateMessage('Rundmail wurde erfolgreich verschickt.');			
	}	
};
function verwarnung (user, params, command){
	if(!user.isChannelModerator()) {
		user.sendPrivateMessage('Du bist nicht berechtigt diesen Command zu nutzen');
		return;
	}
	if (params.length === 0) {
		user.sendPrivateMessage('Du musst schon was eingeben');
	}
	else {
		var text = '°BB°_'+ user.getNick() + '_°r° hat °BB°_'+ params.escapeKCode() +'_°r° im Channel °BB°_Humor P@rty_°r° Verwarnt';
		botUser.sendPublicMessage('°BB°_'+ user.getNick() +'_°r° hat °BB°_'+ params +'_°r° verwarnt.°#°Bei wiederhandlung wird der °BB°_MCM_°r° dich des Channels verweisen');
		for (var i = 0; i < Moderators.length; i++) {
		var Moderator = Moderators[i];
		Moderator.sendPostMessage('Verwarnung von '+ user.getNick() , text);
		}
	}

};
function feedbackApp (user, params) {
	var text = 'Ein Feedback ist von '+ user.getNick() + ' eingetroffen °#° Inhalt des Feedbacks ist: °#° '+ params.escapeKCode();
	appInfo.getAppDeveloper().sendPostMessage('Feedback von '+ user.getNick() , text);
	user.sendPrivateMessage('Dein Feedback wurde abgeschickt!');
};
function changelogapp (user, command, params) {
	var htmlFile = new HTMLFile('changelog.html');
	var popupContent = AppContent.popupContent(htmlFile, 400, 800);
	user.sendAppContent(popupContent);
};
function u (user, params, command) {
        if (user.isAppManager())
        {
            var appAccess = KnuddelsServer.getAppAccess();
            var rootInstance = appAccess.getOwnInstance().getRootInstance();
            rootInstance.updateApp();
             
            user.sendPrivateMessage('Ich habe soeben ein Update angestoßen.');
        }
 };
 function mcmBefehle (user, params, command) {
	var htmlFile = new HTMLFile('mcmbefehle.html');
	var popupContent = AppContent.popupContent(htmlFile, 400, 800);
	user.sendAppContent(popupContent);
	user.sendPrivateMessage('Es wurde so eben das mcmBefehle PoPUp geöffnet');
};
function impressum (user, params, command) {
	var htmlFile = new HTMLFile('impressum.html');
	var popupContent = AppContent.popupContent(htmlFile, 400, 800);
	user.sendAppContent(popupContent);
	user.sendPrivateMessage('Es wurde so eben das Impressum geöffnet');
};
function umfrage (user, params, command) {
	var htmlFile = new HTMLFile('start.html');
	var popupContent = AppContent.popupContent(htmlFile, 50,50);
	user.sendAppContent (popupContent);
};

function uvote (user, params, command) {
	if(aktuelleUmfrage == null) { //Erstmal schauen ob überhaupt eine Umfrage läuft
		user.sendPrivateMessage("Die Umfrage ist vorbei."); //Umfrage beendet User bekommt hinweis!
		return;
	}

	if(typeof aktuelleUmfrage.teilnehmer[user.getUserId()] != 'undefined') { //Dann ob der User bereits in der Teilnehmerliste ist
		user.sendPrivateMessage("Du hast bereits abgestimmt.");
		return;
	}
	

	aktuelleUmfrage.votes[params]++;
	aktuelleUmfrage.teilnehmer[user.getUserId()] = true;

	user.sendPrivateMessage("Danke für deine Teilnahme bei meiner Umfrage. Du hast für '" +  aktuelleUmfrage.antworten[params] + "' gestimmt.")
};

function history(user, params, command) {
	if(!user.isChannelModerator()) {
		user.sendPrivateMessage('Du hast keine Berichtigung für diese Funktion.');
		return;
	}
	else {
	var countTo = 0;
	if(params.length != 0 && !isNaN(parseFloat(params)) && isFinite(params)) {
		countTo = vergangeneUmfragen.length - parseInt(params);
		if(countTo < 0)
			countTo = 0;
	}
	for(var i = vergangeneUmfragen.length - 1; i >= countTo; i--) {
		var umfrage = vergangeneUmfragen[i];
		if(typeof umfrage.createdAt != 'undefined')
			var str = "Umfrage '" + umfrage.frage + "' von " + umfrage.ersteller.getProfileLink() + " erstellt am " + umfrage.createdAt + ": ";
		else
			var str = "Umfrage '" + umfrage.frage + "' von " + umfrage.ersteller.getProfileLink() + ": ";


		for(var j = 0; j < umfrage.antworten.length; j++) {
			str += "'" + umfrage.antworten[j] + "' (" + umfrage.votes[j] + "), ";
		}
		user.sendPrivateMessage(str);
	}}
}