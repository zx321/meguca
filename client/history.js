// HTML5 history & cache controller
var Shota = function(href){
	// Cross-board links are currently handled by loading a redirect page,
	// so not possible to use HTML5 history
	// TODO: Implement cross-board logic
	var pat = new RegExp('^\\d|^\\.$|^page|^\\.\\.\/'+BOARD+'\/');
	if (!pat.test(href))
		return location.href = href;
	//disconnect();
	// TODO: Curenntly caching to sessionStorage would require a lot of looping
	// and selectors, which is suboptimal. Should revisit this after all sections,
	// .pagination, #bottom, etc. is contained in a single threads element
	//cacheToSS();
	this.href = href;
	this.board = BOARD;
	var m = href.match(/^(\d+)(?:#\d+)?/);
	this.thread = m ? m[1] : 0;
	m = href.match(/^page(\d+)$/);
	this.page = m ? m[1] : -1;
	this.lastN = getLastN(href);
	this.findSkirt();
};

function getLastN(href){
	var l;
	var m = href.match(/\?last=(\d+)/);
	if (m)
		l= m[1];
	return l;
}

// Cache current html
function cacheToSS(){
	var lastN = getLastN(location.search);
	var footage = JSON.stringify({
		'title': title,
		sections: $('section').html(),
		pagination: $('.pagination').first().html(),
	});
	var tag = SSTag(THREAD, BOARD, PAGE, lastN);
	sessionStorage.setItem(tag, footage);
	history.replaceState(tag, $('title').html(), location.pathname);
};


function SSTag(t, b, p, l){
	if (t)
		return b+':'+t+ (l ? 'last:'+l : '');
	var label = 'board:'+b;
	if (p > -1)
		label += ':page:'+p;
	return label;
}

// Check for chached html & parse
Shota.prototype.findSkirt = function(){
	/*var tag = SSTag(this.thread, this.board, this.page, this.lastN);
	var skirt = sessionStorage.getItem(tag);
	if (!skirt)*/
		return this.acquireSkirt();
	skirt = JSON.parse(skirt);
};

// Fetch new html
Shota.prototype.acquireSkirt = function(){
	var self = this;
	$.ajax(self.href+ (/\?/.test(self.href) ? '&' : '?') +'minimal=true', {complete: function(resp){
		if (resp.status != 200)
			return alert('Could not complete request. Status code: '+resp.status);
		self.skirt = resp.responseText;
		// Lead to a different board
		if (/\A<!doctype/i.test(self.skirt))
			return location.href = self.href;
		self.putOnSkirt();
	}});
};

// Unload current content & replace
Shota.prototype.putOnSkirt = function(){
	Backbone.trigger('unloadThreads');
	$('.pagination, .act, #lock, h1, .sectionHr').remove();
	var self = this;
	$('body').append($(self.skirt));
	$('title').html($());
	var lastN = getLastN(self.href);
	var tag = SSTag(THREAD, BOARD, PAGE, lastN);
	history.pushState(tag, self.title, self.href);
	// Various functions, that need to be rerun on load
	loadPageVars();
	mine = Mine.read_all();
	Mine.purge_expired_soon();
	Threads = new ThreadCollection();
	UnknownThread = new Thread();
	Unread = new Backbone.Model({unreadCount: 0});
	scan_threads_for_extraction();
	mumboJumbo();
	//connect();
};

