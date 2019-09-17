(function() {

	var $themeLink = $("#dark-css");
	var themeLocation = $('meta[data-dark-theme]').data("dark-theme");
    console.log(themeLocation);
	var $themeButton = $('a.theme-switcher');
	var themecookie = Tools.getCookie("theme");

	if (themecookie != "" || themecookie != null)
		$themeLink.attr("href", themecookie);

	$themeButton.click(function() {
		if ($themeLink.attr("href") == themeLocation) {
			$themeLink.attr("href", "");
			Tools.setCookie("theme", "default", 0);
		}
		else {
			$themeLink.attr("href", themeLocation);
			Tools.setCookie("theme", themeLocation, 9999);
		}
	})
})();