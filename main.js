/* global KnuddelsServer, instance, UserStatus */

var botUser = KnuddelsServer.getDefaultBotUser();
var channelname = KnuddelsServer.getChannel().getChannelName();
var james = KnuddelsServer.getFullImagePath('sm_abo-wlcm2012_jamesdance.gif');
var nono = KnuddelsServer.getFullImagePath('nono.gif');
var cmehren = KnuddelsServer.getFullImagePath('sm_ehren_01.gif');
var logo = KnuddelsServer.getFullImagePath('logo_neu.png');
var ownInstance = KnuddelsServer.getAppAccess().getOwnInstance();
var Moderators = KnuddelsServer.getChannel().getChannelConfiguration().getChannelRights().getChannelModerators();
var appInfo = ownInstance.getAppInfo();
var appName = appInfo.getAppName();
var appVersion = appInfo.getAppVersion();
var vmcm_icon = KnuddelsServer.getFullImagePath('vmcm.png'); //icon VMCM// 
var vmcms = [];
var ban = [];


var aktuelleUmfrage = null;

var vergangeneUmfragen = [];

var langzeitUmfragen = [];

function formatTime(time) {
	return time.getDate() + "." + (time.getMonth() + 1) + "." + time.getFullYear() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
}

var Umfrage = function(frage, antworten, ersteller, public) {
	this.frage = frage;
	this.antworten = antworten;
	this.teilnehmer = {};
	this.votes = [];
	this.ersteller = ersteller;
	this.public = public;
	this.createdAt = formatTime(new Date());
	/*this.status = status;*/

	for (var i = 0; i < antworten.length; i++)
		this.votes[i] = 0;
};

var LonglifeUmfrage = function(id, frage, antworten, ersteller, public, ende) {
	this.id = id;
	this.frage = frage;
	this.antworten = antworten;
	this.teilnehmer = {};
	this.votes = [];
	this.ersteller = ersteller;
	this.public = public;
	this.createdAt = formatTime(new Date());
	/*this.status = status;*/
	this.ende = ende;

	for (var i = 0; i < antworten.length; i++)
		this.votes[i] = 0;
};

//erstmal eine Struktur die die ganzen Daten hält die wir brauchen, ich schreibe dich mit in das Impressum, hilfst mir ja

function removeA(arr) {
	var what, a = arguments,
		L = a.length,
		ax;
	while (L > 1 && arr.length) {
		what = a[--L];
		while ((ax = arr.indexOf(what)) !== -1) {
			arr.splice(ax, 1);
		}
	}
	return arr;
}

require('mcm.js');

var App = (new function() {
	var instance = this;
	this.onAppStart = function() {
		vergangeneUmfragen = KnuddelsServer.getPersistence().getObject('umfragen', []);
		vmcms = KnuddelsServer.getPersistence().getObject('vmcms', []);
		langzeitUmfragen = KnuddelsServer.getPersistence().getObject('langzeitumfragen', []);
		
		var users = KnuddelsServer.getChannel().getOnlineUsers();
		for (var index in users) {
			instance.onUserJoined(users[index]);
		}

		for (var i in langzeitUmfragen) {
			var umfrage = langzeitUmfragen[i];
if(umfrage.ende - Date.now() < 2147483647)
			setTimeout(function() {
				//So, 3 sekunden sind rum. Zählen wir doch mal
				var str = "Die Umfrage '" + umfrage.frage + "' ist jetzt beendet. Hier die Anzahl der Stimmen:°#°";

				for (var i = 0; i < umfrage.antworten.length; i++) {
					str += "Antwortmöglichkeit '" + umfrage.antworten[i] + "' wurde " + umfrage.votes[i] + " mal gewählt°#°";
				}
				if (umfrage.public) {
					botUser.sendPublicMessage(str);
				}

				umfrage.ersteller.sendPostMessage('Deine Umfrage' + umfrage.id, str);

				vergangeneUmfragen.push(umfrage);

				langzeitUmfragen = removeA(langzeitUmfragen, umfrage);

			}, umfrage.ende - Date.now());
		}
	};
	this.mayJoinChannel = function(user) {
		if (ban.indexOf(user.getUserId()) != -1) {
			return ChannelJoinPermission.denied('Tut mir leid aber du darfst diesen Channel nicht betreten');
		}
		else {
			return ChannelJoinPermission.accepted();
		}
	};
	this.onEventReceived = function(user, type, data, appContentSession) {
		if (type == 'history') {
			history(user,"","/history");
		}
		if (type == 'impressum') {
			impressum(user,"","/impressum");
		}
		if (type === 'frage') {
			appContentSession.remove();
			if (data['time'] >= 3600) {
				var id = RandomOperations.nextInt(0, 9999999);

				var frage = data['question'].escapeKCode();
				var frageisOk = data['question'].isOk();
				if (frageisOk){ 
					return 
				}
				botUser.sendPublicMessage('°BB°°20°_Channelumfrage_ °r°_' + user.getProfileLink() + '_! ' + frage + ' ?');

				var antworten = data['antwort'];

				if (typeof antworten == "string") {
					antworten = [antworten];
				}
				for (var i = 0; i < antworten.length; i++) {
					antworten[i] = antworten[i].escapeKCode();
					botUser.sendPublicMessage('°#°°>CENTER<°°>{button}' + antworten[i] + ' ||call|/lvote ' + id + ' ' + i + '<°°#°°>LEFT<°');
				}
				var time = data['time'] * 1000;


				var public = typeof data['public'] != 'undefined';
				var umfrage = new LonglifeUmfrage(id, frage, antworten, user, public, Date.now() + time);

				langzeitUmfragen.push(umfrage);
				botUser.sendPublicMessage('Die Langzeitumfrage läuft bis ' + formatTime(new Date(umfrage.ende)));

				setTimeout(function() {
					//So, 3 sekunden sind rum. Zählen wir doch mal
					var str = "Die Umfrage '" + umfrage.frage + "' ist jetzt beendet. Hier die Anzahl der Stimmen:°#°";

					for (var i = 0; i < umfrage.antworten.length; i++) {
						str += "Antwortmöglichkeit '" + umfrage.antworten[i] + "' wurde " + umfrage.votes[i] + " mal gewählt°#°";
					}

					if (umfrage.public) {
						botUser.sendPublicMessage(str);
					}

					umfrage.ersteller.sendPostMessage('Deine Umfrage', str);


					vergangeneUmfragen.push(umfrage);

					langzeitUmfragen = removeA(langzeitUmfragen, umfrage);

				}, time); //Kann man nun Auswählen (siehe HTML)
			} else {
				if (aktuelleUmfrage != null) {
					user.sendPrivateMessage("Es läuft aktuell bereits eine Umfrage");
					return;
				}


				var frage = data['question'].escapeKCode();
				var ausgabe = '°#°°>CENTER<°°BB°°20°_Channelumfrage_°r° von _' + user.getProfileLink() + '_!°##°' + frage + ' ?°##°';

				var antworten = data['antwort'];

				if (typeof antworten == "string")
					antworten = [antworten];

				for (var i = 0; i < antworten.length; i++) {
					antworten[i] = antworten[i].escapeKCode();
					ausgabe += '°>{button}' + antworten[i] + ' ||call|/uvote ' + i + '<° ';
				}
				var time = data['time'] * 1000; //mal tausend da JS usw. in millisekunden rechnet
				ausgabe += "°##°°>{countdown}time=" + time + "|timeUpText=   <°°#°°>LEFT<°";
				botUser.sendPublicMessage(ausgabe);
				var public = typeof data['public'] != 'undefined';
				aktuelleUmfrage = new Umfrage(frage, antworten, user, public);

				setTimeout(function() {
					//So, 3 sekunden sind rum. Zählen wir doch mal
					var str = "Die Umfrage '" + aktuelleUmfrage.frage + "' ist jetzt beendet. Hier die Anzahl der Stimmen:°#°";

					for (var i = 0; i < aktuelleUmfrage.antworten.length; i++) {
						str += "Antwortmöglichkeit '" + aktuelleUmfrage.antworten[i] + "' wurde " + aktuelleUmfrage.votes[i] + " mal gewählt°#°";
					}
					if (aktuelleUmfrage.public) {
						botUser.sendPublicMessage(str);
					} else {
						aktuelleUmfrage.ersteller.sendPrivateMessage(str);
					}

					vergangeneUmfragen.push(aktuelleUmfrage);
					aktuelleUmfrage = null;

				}, time); //Kann man nun Auswählen (siehe HTML)
			}
		}
		if (type === 'feedbackUser') {
			user.sendPrivateMessage('Um Feedback zu senden klicke bitte hier "_°BB>Feedback schreiben|/tf-overridesb /feedbackApp [TEXT]<°°°_')
		}
		if (type === 'umfrage') {
			var htmlFile = new HTMLFile('start.html');
			var popupContent = AppContent.popupContent(htmlFile, 400, 600);
			user.sendAppContent(popupContent);
		}
	};
	this.onPrepareShutdown = function(secondsTillShutdown) {
		botUser.sendPublicMessage('Die App fährt in ' + secondsTillShutdown + ' Sekunde herunter. Nach dem neustart ist sie sofort wieder nutzbar');
	};

	this.onShutdown = function() {
		KnuddelsServer.getPersistence().setObject('umfragen', vergangeneUmfragen);
		KnuddelsServer.getPersistence().setObject('vmcms', vmcms);
		KnuddelsServer.getPersistence().setObject('langzeitumfragen', langzeitUmfragen);
	};

	this.onUserJoined = function(user) {
		var htmlFile = new HTMLFile('buttons.html');
		var appContent = AppContent.overlayContent(htmlFile);
		var overlayContent = AppContent.overlayContent(htmlFile, 200, 250);

		if (user.canSendAppContent(appContent)) {
			user.sendPrivateMessage('Du kannst die App benutzen. Viel Spaß!');
			user.sendAppContent(overlayContent);
		} else {
			user.sendPrivateMessage('Du kannst diese App mit diesem Gerät leider nicht benutzen.');
		}


		user.sendPrivateMessage('°#°°>CENTER<°°>' + logo + '<°°#°°>LEFT<°');
		botUser.sendPublicActionMessage('fordert ' + user + ' auf, setz dich doch zu uns');
		if (user.isChannelModerator() === true) {
			user.sendPrivateMessage('Hallo ' + user + ', da du  °BB°_MCM_°r°  im Channel °RR°_ ' + channelname + ' _°r° bist kannst du mit _°BB>/changelogapp|/changelogapp<°°°_ dir die Aktuellen änderungen und Versionen der App anschauen°#°°#°Aktuelle App Version ' + appVersion + ' oder du gibst _°BB>mcmBefehle|/mcmBefehle<°°°_ ein und bekommst alle Befehle aus dem Channel hier ausgegeben');
		} else if (user.getUserStatus().isAtLeast(UserStatus.SystemBot)) {
			botUser.sendPublicMessage(user + ' Herzlich Willkommen im ' + channelname + ', wir freuen uns das du da bist °>' + james + '<° °#°Du bist SystemBot');
		} else if (user.getUserStatus().isAtLeast(UserStatus.Sysadmin)) {
			botUser.sendPublicMessage(user + ' Herzlich Willkommen im ' + channelname + ', wir freuen uns das du da bist °>' + james + '<° °#°Du bist SysAdmin');
		} else if (user.getUserStatus().isAtLeast(UserStatus.Admin)) {
			botUser.sendPublicMessage(user + ' Herzlich Willkommen im ' + channelname + ', wir freuen uns das du da bist °>' + james + '<° °#°Du bist Admin');
		} else if (user.getUserStatus().isAtLeast(UserStatus.HonoryMember)) {
			botUser.sendPublicMessage(user + ' Herzlich Willkommen im ' + channelname + ', wir freuen uns das du da bist °>' + james + '<° °#°Du bist Ehrenmitglied');
		} else if (user.getUserStatus().isAtLeast(UserStatus.Stammi)) {
			botUser.sendPublicActionMessage('°BB°_Stammi_°r° ' + user + ' setz dich');
		} else if (user.getUserStatus().isAtLeast(UserStatus.Family)) {
			botUser.sendPublicActionMessage('bietet °BB°_Family Mitglied_°r° ' + user + ' einen Platze neben James an, setz dich doch');
		} else {
			botUser.sendPublicMessage(user + ' Herzlich Willkommen im ' + channelname + ', wir freuen uns das du da bist°>' + james + '<°°#°Du bist Newbie');
		}

		if (vmcms.indexOf(user.getUserId()) != -1) {
			user.addNicklistIcon(vmcm_icon, 35);
		}



		var offeneUmfrage = false;
		for (var i in langzeitUmfragen) {
			if (typeof langzeitUmfragen[i].teilnehmer[user.getUserId()] == 'undefined') { //Dann ob der User bereits in der Teilnehmerliste ist
				offeneUmfrage = true;
				break;
			}
		}

		if (offeneUmfrage)
			user.sendPrivateMessage("Es laufen °>{button}Umfragen||call|/lumfragen<° an denen du noch nicht teilgenommen hast.")


	};
	this.chatCommands = {
		'mcmmail': function(user, params, command) {
			mcmmail(user, params, command);
		},
		'feedbackApp': function(user, params) {
			feedbackApp(user, params);
		},
		'changelogapp': function(user, command, params) {
			changelogapp(user, command, params);
		},
		'u': function(user, params, command) {
			u(user, params, command);
		},
		'mcmBefehle': function(user, params, command) {
			mcmBefehle(user, params, command);
		},
		'impressum': function(user, params, command) {
			impressum(user, params, command);
		},
		'uvote': function(user, params, command) {
			uvote(user, params, command);
		},
		'lvote': function(user, params, command) {
			lvote(user, params, command);
		},
		'lumfragen': function(user, params, command) {
			lumfragen(user, params, command);
		},
		'history': function(user, params, command) {
			history(user, params, command);
		},
		'vmcm': function(user, params, command) {
			vmcm(user, params, command)
		},
		'dvmcm': function (user, params, command) {
			dvmcm(user, params, command)
		},
		'banApp': function (user, params, command) {
			banApp(user, params, command)
		},
		'ubanApp': function (user, params, command) {
			ubanApp(user, params, command)
		},
	};
	this.onUserLeft = function(user) {
		user.sendPrivateMessage('Hey ' + user.getNick() + ', du gehst schon? Magst du uns vllt sagen wie dir diese App gefällt?')
		botUser.sendPublicMessage(user.getProfileLink() + ' hat den Channel verlassen');
	};
});