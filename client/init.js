var CurThread;

var $DOC = $(document);
var $name = $('input[name=name]'), $email = $('input[name=email]');
var $ceiling = $('hr.sectionHr:first');

DEFINES.PAGE_BOTTOM = -1;
var menuOptions = ['Focus'];
var menuHandlers = {};

var syncs = {}, ownPosts = {};
var readOnly = ['archive'];

var connSM = new FSM('load');
var postSM = new FSM('none');
var TAB_ID = random_id();
var CONN_ID;

var oneeSama = new OneeSama(function (num) {
	var frag;
	if (this.links && num in this.links) {
		var op = this.links[num];
		var post = Threads.lookup(num, op);
		var desc = post && post.get('mine') && '(You)';
		frag = this.post_ref(num, op, desc);
	}
	else
		frag = '>>' + num;
	this.callback(frag);
});
oneeSama.full = oneeSama.op = THREAD;
// Pass relative post timestamp setting to the client-side oneeSama
if ($.cookie('rTime') == 'true')
	oneeSama.rTime = true;
// Pass linkification setting to client-side oneeSama
if ($.cookie('linkify') == 'true')
	oneeSama.eLinkify = true;

// Extra functions that need to be rerun, when switching threads with HTML5 history
// TODO:0.5: Remove as much as possible or inbuild into models
mumboJumbo();
function mumboJumbo(){
	var m = window.location.hash.match(/^#q?(\d+)$/);
	if (m)
		set_highlighted_post(m[1]);

	$('section').each(function () {
		var s = $(this);
		syncs[s.attr('id')] = parseInt(s.attr('data-sync'));

		/* Insert image omission count (kinda dumb) */
		if (!THREAD) {
			var img = parseInt(s.attr('data-imgs')) -
					s.find('img').length;
			if (img > 0) {
				var stat = s.find('.omit');
				var o = stat.text().match(/(\d*)/)[0];
				stat.text(abbrev_msg(parseInt(o), img));
			}
		}
	});

	$('del').attr('onclick', 'void(0)');

	// Android browsers have no easy way to return to the top, so link it
	var android = /Android/.test(navigator.userAgent);
	if (android) {
		var t = $.parseHTML(action_link_html('#', 'Top'))[0];
		$('#bottom').css('min-width', 'inherit').after('&nbsp;', t);
	}
};

var UAMessage;
// Query user agent with ua-parser
if (postedFrom){
	(function(){
		var common = '\n\nPosted from ';
		var browser = new UAParser().getResult().browser;
		if (!browser || !browser.name)
			return UAMessage = common + 'NSA headquarters~';
		UAMessage = common + browser.name + '~';
	})();
}
