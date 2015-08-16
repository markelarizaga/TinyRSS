angular.module('TinyRSS').
controller('Categories',
	['$scope',
	'backendService',
	'feedsCache',
	'sectionNavigator',
	'$routeParams',
	'networkStatusService',
	'backgroundActivityService',
function($scope, backendService, feedsCache, sectionNavigator, $routeParams, networkStatusService, backgroundActivityService) {

	$scope.currentPage = !sectionNavigator.isComingBack() ? 'categories-view' : 'categories-view-back';
	var categories = null;
	var categoryId = $routeParams.categoryId;
	if(!categoryId) {
		retrieveCategories();
	} else {
		retrieveFeedsByCategoryId(categoryId);
	}

	function retrieveCategories() {
		if(networkStatusService.isOnline() && !sectionNavigator.isComingBack()) {
			backgroundActivityService.notifyBackgroundActivity();
			backendService.downloadCategories()
			.then(function(categories) {
					if(categories.error && categories.error === 'NOT_LOGGED_IN') {
						sectionNavigator.navigateTo(sectionNavigator.section.LOGIN, true, true, true);
					} else {
						showCategoriesOnScreen(categories);
					}
				},
				getCategoriesFromCache); // Called in case of error

		} else {
			getCategoriesFromCache();
		}
	}

	function retrieveFeedsByCategoryId(categoryId) {
		if(networkStatusService.isOnline() && !sectionNavigator.isComingBack()) {
			backgroundActivityService.notifyBackgroundActivity();
			// Retrieve child elements from server
			backendService.downloadFeeds(categoryId)
			.then(function(feeds){
					if(feeds.error && feeds.error === 'NOT_LOGGED_IN') {
						sectionNavigator.navigateTo(sectionNavigator.section.LOGIN, true, true, true);
					} else {
						showFeedsOnScreen(feeds);
					}
				},
				function() {
					getChildrenFromCache(categoryId);
				});
		} else {
			getChildrenFromCache(categoryId);
		}
	}

	function getCategoriesFromCache() {
		categories = feedsCache.getElements();
		if(categories) {
			$scope.categories = categories;
		}
		backgroundActivityService.notifyBackgroundActivityStopped();
	}

	function getChildrenFromCache(categoryId) {
		var children = feedsCache.getElements(categoryId);
		if(children && children.constructor === Array) {
			$scope.categories = children;
		}
		backgroundActivityService.notifyBackgroundActivityStopped();
	}

	function showCategoriesOnScreen(categories) {
		backgroundActivityService.notifyBackgroundActivityStopped();
		$scope.categories = categories;
		feedsCache.addToCache(categories);
	}

	function showFeedsOnScreen(feeds) {
		feedsCache.addToCache(feeds, categoryId);
		backgroundActivityService.notifyBackgroundActivityStopped();
		$scope.categories = feeds;
	}

	$scope.openElement = function(element) {
		if(element.feed_url) {
			sectionNavigator.navigateTo(sectionNavigator.section.LIST, element.id);
		} else {
			sectionNavigator.navigateTo(sectionNavigator.section.CATEGORIES, element.id);
		}
	};
}]);
