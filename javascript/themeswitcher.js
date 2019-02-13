(function() {

	var $themeLink = $("#dark-css");
	var themeLocation = "css/dark.css";
	var $themeButton = $('a.theme-switcher');

	$themeButton.click(function() {
		if ($themeLink.attr("href") == themeLocation) {
			$themeLink.attr("href", "");
		}
		else {
			$themeLink.attr("href", themeLocation);
		}
	})
})();