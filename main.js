/* global KnuddelsServer, instance, UserStatus */

var botUser 					= KnuddelsServer.getDefaultBotUser();
var channelname					= KnuddelsServer.getChannel().getChannelName();
var james						= KnuddelsServer.getFullImagePath('sm_abo-wlcm2012_jamesdance.gif');
var nono						= KnuddelsServer.getFullImagePath('nono.gif');
var cmehren						= KnuddelsServer.getFullImagePath('sm_ehren_01.gif');
var logo						= KnuddelsServer.getFullImagePath('logo_neu.png');
var ownInstance 				= KnuddelsServer.getAppAccess().getOwnInstance();
var Moderators 					= KnuddelsServer.getChannel().getChannelConfiguration().getChannelRights().getChannelModerators();
var appInfo 					= ownInstance.getAppInfo();
var appName 					= appInfo.getAppName();
var appVersion 					= appInfo.getAppVersion();

var aktuelleUmfrage = null;

var vergangeneUmfragen = [];

function formatTime(time) {
	return time.getDate() + "." + (time.getMonth()+1) + "." + time.getFullYear() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
}

var Umfrage = function(frage, antworten, ersteller, public) {
	this.frage = frage;
	this.antworten = antworten;
	this.teilnehmer = {};
	this.votes = [];
	this.ersteller = ersteller;
	this.public = public;
	this.createdAt = formatTime(new Date());

	for(var i = 0; i < antworten.length; i++)
		this.votes[i] = 0;
};

//erstmal eine Struktur die die ganzen Daten hält die wir brauchen, ich schreibe dich mit in das Impressum, hilfst mir ja




require('mcm.js');

var App = (new function(){
		var instance 		= this;
	this.onAppStart = function() {
		var users = KnuddelsServer.getChannel().getOnlineUsers();
		for(var index in users) {
			instance.onUserJoined(users[index]);
		}
		vergangeneUmfragen = KnuddelsServer.getPersistence().getObject('umfragen', []);
	};

    this.onEventReceived = function(user, type, data, appContentSession) {
        if (type === 'frage') {
        	if(aktuelleUmfrage != null) {
        		user.sendPrivateMessage("Es läuft aktuell bereits eine Umfrage");
        		return;
        	}
			appContentSession.remove();

            var frage = data['question'];
            botUser.sendPublicMessage('°BB°°20°_Channelumfrage_ °r°' + user.getNick() + '! ' + frage + ' ?');
    		
    		var antworten = data['antwort'];

    		if(typeof antworten == "string")
    			antworten = [antworten];
    	
    		for(var i = 0; i < antworten.length; i++) {
				botUser.sendPublicMessage('°BB°°20°_Antwort Möglichkeit ' + (i + 1) + '_ °>{button}' + antworten[i] + ' ||call|/uvote ' + i + '<°');
    		}
    		var time = data['time'] * 1000; //mal tausend da JS usw. in millisekunden rechnet

    		// Jetzt noch verwenden
    		botUser.sendPublicMessage('Du hast noch °>{countdown}time=' + time + '<° um abzustimmen');
    		var public = typeof data['public'] != 'undefined';
    		aktuelleUmfrage = new Umfrage(frage, antworten, user, public);

    		setTimeout(function(){
    			//So, 3 sekunden sind rum. Zählen wir doch mal
    			var str = "Die Umfrage '" + aktuelleUmfrage.frage + "' ist jetzt beendet. Hier die Anzahl der Stimmen:°#°";

    			for(var i = 0; i < aktuelleUmfrage.antworten.length; i++) {
    				str += "Antwortmöglichkeit '" + aktuelleUmfrage.antworten[i] + "' wurde " + aktuelleUmfrage.votes[i] + " mal gewählt°#°";
    			}
    			if(aktuelleUmfrage.public) {
    				botUser.sendPublicMessage(str);
    			}else {
    				aktuelleUmfrage.ersteller.sendPrivateMessage(str);
    			}

    			vergangeneUmfragen.push(aktuelleUmfrage);
    			aktuelleUmfrage = null;

    		}, time); //Kann man nun Auswählen (siehe HTML)
		}
		if (type === 'feedbackUser') {
		user.sendPrivateMessage('Um Feedback zu senden klicke bitte hier "_°BB>Feedback schreiben|/tf-overridesb /feedbackApp [TEXT]<°°°_')
	}
	if (type === 'umfrage') {
			var htmlFile = new HTMLFile('start.html');
			var popupContent = AppContent.popupContent(htmlFile, 400,800);
			user.sendAppContent (popupContent);
	}
	if (type === 'history') {
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
	};
	this.onPrepareShutdown = function(secondsTillShutdown){
		botUser.sendPublicMessage('Die App fährt in ' + secondsTillShutdown + ' Sekunde herunter. Nach dem neustart ist sie sofort wieder nutzbar');
	};

	this.onShutdown = function() {
		KnuddelsServer.getPersistence().setObject('umfragen', vergangeneUmfragen);
	};

	this.onUserJoined = function(user) {
	var htmlFile = new HTMLFile('buttons.html');
	var appContent = AppContent.overlayContent(htmlFile);
	var overlayContent = AppContent.overlayContent(htmlFile, 200, 250);
	if (user.canSendAppContent(appContent))
	{
    message = 'Du kannst die App benutzen. Viel Spaß!';
	}
	else
	{
    message = 'Du kannst diese App mit diesem Gerät leider nicht benutzen.';
	}
	user.sendPrivateMessage(message);
	user.sendAppContent(overlayContent);
	user.sendPrivateMessage('°#°°>CENTER<°°>' + logo + '<°°#°°>LEFT<°');
	botUser.sendPublicActionMessage('fordert ' + user + ' auf, setz dich doch zu uns');
	if(user.isChannelModerator()===true) {
		user.sendPrivateMessage('Hallo ' + user + ', da du  °BB°_MCM_°r°  im Channel °RR°_ ' + channelname + ' _°r° bist kannst du mit _°BB>/changelogapp|/changelogapp<°°°_ dir die Aktuellen änderungen und Versionen der App anschauen°#°°#°Aktuelle App Version '+ appVersion+ ' oder du gibst _°BB>mcmBefehle|/mcmBefehle<°°°_ ein und bekommst alle Befehle aus dem Channel hier ausgegeben');
		return;
	}
	else if (user.getUserStatus().isAtLeast(UserStatus.SystemBot)) {
		botUser.sendPublicMessage(user +' Herzlich Willkommen im ' + channelname + ', wir freuen uns das du da bist °>'+ james +'<° °#°Du bist SystemBot');
	}
	else if (user.getUserStatus().isAtLeast(UserStatus.Sysadmin)) {
		botUser.sendPublicMessage(user +' Herzlich Willkommen im ' + channelname + ', wir freuen uns das du da bist °>'+ james +'<° °#°Du bist SysAdmin');
	}
	else if (user.getUserStatus().isAtLeast(UserStatus.Admin)) {
		botUser.sendPublicMessage(user +' Herzlich Willkommen im ' + channelname + ', wir freuen uns das du da bist °>'+ james +'<° °#°Du bist Admin');
	}
	else if (user.getUserStatus().isAtLeast(UserStatus.HonoryMember)) {
			botUser.sendPublicMessage(user +' Herzlich Willkommen im ' + channelname + ', wir freuen uns das du da bist °>'+ james +'<° °#°Du bist Ehrenmitglied');
		}
		else if (user.getUserStatus().isAtLeast(UserStatus.Stammi)) {
			botUser.sendPublicActionMessage('°BB°_Stammi_°r° '+ user +' setz dich');		
		}
		else if (user.getUserStatus().isAtLeast(UserStatus.Family)) {
			botUser.sendPublicActionMessage('bietet °BB°_Family Mitglied_°r° '+ user +' einen Platze neben James an, setz dich doch');
		}
		else {
			botUser.sendPublicMessage(user +' Herzlich Willkommen im ' + channelname + ', wir freuen uns das du da bist°>'+ james +'<°°#°Du bist Newbie');
		}
	};
	this.chatCommands = {
		'umfrage':function (user, params, command) {
			umfrage (user, params, command);
		},
		'mcmmail':function (user, params, command) {
			mcmmail (user, params, command);
		},
		'feedbackApp': function(user, params)
		{
			feedbackApp(user, params);
		},
		'changelogapp':function (user, command, params) {
			changelogapp(user, command, params);
		},
		'u':function (user, params, command) {
			u (user, params, command);
		},
		'mcmBefehle':function (user, params, command) {
			mcmBefehle (user, params, command);
		},
		'impressum':function (user, params, command) {
			impressum (user, params, command);
		},
		'uvote': function (user, params, command) {
			uvote(user, params, command);
		},
		'history': function(user, params, command) {
			history(user, params, command);
		}
	};
	this.onUserLeft = function(user) {
		user.sendPrivateMessage('Schade das du gehst ' + user.getNick() + ', beehr uns bald wieder im Channel');
		//user.sendPrivateMessage('Denk dran°#°°#°°BB°Nächstes Event am _18.02.2016_ um _19:00 Uhr_ Videostream des Europa Pokal Spiels°r°');//
		botUser.sendPublicMessage(user.getProfileLink() +' hat den Channel verlassen');
	};
});	