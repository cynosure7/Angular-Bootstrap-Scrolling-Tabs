;(function () {
    'use strict';

    var CONSTANTS = {
        SCROLL_OFFSET_PIXEL: 200,
        SCROLL_OFFSET_BOUNDARY_PIXEL: 50,
        SCROLL_ANIMATION_DURATION: 500,
        SCROLL_ANIMATION_BOUNDARY_DURATION: 100
    },

    scrollingTabsModule = angular.module('mj.scrollingTabs', []),


    /* *************************************************************
     * scrolling-tabs-wrapper element directive template
     * *************************************************************/
    // plunk: http://plnkr.co/edit/lWeQxxecKPudK7xlQxS3
    scrollingTabsWrapperTemplate = [
    '<div class="scrtabs-tab-container">',
    ' <div class="scrtabs-tab-scroll-arrow scrtabs-js-tab-scroll-arrow-left"><span class="glyphicon glyphicon-chevron-left"></span></div>',
    '   <div class="scrtabs-tabs-fixed-container">',
    '     <div class="scrtabs-tabs-movable-container" ng-transclude></div>',
    '   </div>',
    ' <div class="scrtabs-tab-scroll-arrow scrtabs-js-tab-scroll-arrow-right"><span class="glyphicon glyphicon-chevron-right"></span></div>',
    '</div>'
    ].join('');


    // smartresize from Paul Irish (debounced window resize)
    (function ($, sr) {
        var debounce = function (func, threshold, execAsap) {
            var timeout;

            return function debounced() {
                var obj = this, args = arguments;
                function delayed() {
                    if (!execAsap)
                        func.apply(obj, args);
                    timeout = null;
                }

                if (timeout)
                    clearTimeout(timeout);
                else if (execAsap)
                    func.apply(obj, args);

                timeout = setTimeout(delayed, threshold || 100);
            };
        };
        jQuery.fn[sr] = function (fn) { return fn ? this.bind('resize.scrtabs', debounce(fn)) : this.trigger(sr); };

    })(jQuery, 'smartresize');



    /* ***********************************************************************************
     * EventHandlers - Class that each instance of ScrollingTabsControl will instantiate
     * **********************************************************************************/
     function EventHandlers(scrollingTabsControl) {
        var evh = this;

        evh.stc = scrollingTabsControl;
    }

    // prototype methods
    (function (p){
        p.handleClickOnLeftScrollArrow = function (e) {
            var evh = this,
            stc = evh.stc;

            if(stc.iScroll.x == 0){
                // left boundary
                stc.iScroll.scrollBy(CONSTANTS.SCROLL_OFFSET_BOUNDARY_PIXEL, 0, CONSTANTS.SCROLL_ANIMATION_BOUNDARY_DURATION);
            } else {
                if(stc.iScroll.x <= -CONSTANTS.SCROLL_OFFSET_PIXEL){
                    // swip SCROLL_OFFSET_PIXEL to right
                    stc.iScroll.scrollBy(CONSTANTS.SCROLL_OFFSET_PIXEL, 0, CONSTANTS.SCROLL_ANIMATION_DURATION);
                } else if(stc.iScroll.x < 0){
                    // swipe to bundary
                    stc.iScroll.scrollBy(Math.abs(stc.iScroll.x), 0, CONSTANTS.SCROLL_ANIMATION_DURATION);
                }
            }
        };

        p.handleClickOnRightScrollArrow = function (e) {
            var evh = this,
            stc = evh.stc;

            if(Math.abs(stc.iScroll.maxScrollX) == Math.abs(stc.iScroll.x)) {
                // right boundary
                stc.iScroll.scrollBy(-CONSTANTS.SCROLL_OFFSET_BOUNDARY_PIXEL, 0, CONSTANTS.SCROLL_ANIMATION_BOUNDARY_DURATION);
            } else {
                if(Math.abs(stc.iScroll.maxScrollX) - Math.abs(stc.iScroll.x) >= CONSTANTS.SCROLL_OFFSET_PIXEL) {
                    // swip SCROLL_OFFSET_PIXEL to left
                    stc.iScroll.scrollBy(-CONSTANTS.SCROLL_OFFSET_PIXEL, 0, CONSTANTS.SCROLL_ANIMATION_DURATION);
                } else if(Math.abs(stc.iScroll.x) < Math.abs(stc.iScroll.maxScrollX)) {
                    // swipe to bundary
                    stc.iScroll.scrollBy(-Math.abs(Math.abs(stc.iScroll.maxScrollX) - Math.abs(stc.iScroll.x)), 0, CONSTANTS.SCROLL_ANIMATION_DURATION);
                }
            }
        };

        p.handleWindowResize = function (e) {
            var evh = this,
            stc = evh.stc,
            newWinWidth = stc.$win.width();

            if (newWinWidth === stc.winWidth) {
                return false; // false alarm
            }

            stc.winWidth = newWinWidth;
            stc.elementsHandler.refreshAllElementSizes(); // true -> check for scroll arrows not being necessary anymore
            stc.iScroll.refresh();
        };

    }(EventHandlers.prototype));



    /* ***********************************************************************************
     * ElementsHandler - Class that each instance of ScrollingTabsControl will instantiate
     * **********************************************************************************/
     function ElementsHandler(scrollingTabsControl) {
        var ehd = this;

        ehd.stc = scrollingTabsControl;
    }

    // ElementsHandler prototype methods
    (function (p) {
        p.initElements = function () {
            var ehd = this,
            stc = ehd.stc,
            $tabsContainer = stc.$tabsContainer;

            ehd.setElementReferences();

            ehd.moveTabContentOutsideScrollContainer();
            
            ehd.setEventListeners();
        };

        p.moveTabContentOutsideScrollContainer = function () {
            var ehd = this,
            stc = ehd.stc,
            $tabsContainer = stc.$tabsContainer;

            $tabsContainer.find('.tab-content').appendTo($tabsContainer);
        };

        p.refreshAllElementSizes = function () {
            var ehd = this,
            stc = ehd.stc,
            scrollArrowsWereVisible = stc.scrollArrowsVisible,
            minPos;

            ehd.setElementWidths();
            ehd.setScrollArrowVisibility();

            if (stc.scrollArrowsVisible) {
                ehd.setFixedContainerWidthForJustVisibleScrollArrows();
                ehd.scrollToActiveTab();
            }
        };

        p.scrollToActiveTab = function () {
            var ehd = this,
            stc = ehd.stc,
            swipeTabsRect = stc.$tabsContainer.find('.scrtabs-tabs-fixed-container')[0].getBoundingClientRect(),
            activeTabRect = stc.$tabsUl.find('li.active')[0].getBoundingClientRect();

            if(activeTabRect.right > swipeTabsRect.right) {
                stc.iScroll.scrollBy(Math.round(swipeTabsRect.right - activeTabRect.right), 0, 500);
            }
        };

        p.setElementReferences = function () {
            var ehd = this,
            stc = ehd.stc,
            $tabsContainer = stc.$tabsContainer;

            stc.isNavPills = false;

            stc.$fixedContainer = $tabsContainer.find('.scrtabs-tabs-fixed-container');
            stc.$movableContainer = $tabsContainer.find('.scrtabs-tabs-movable-container');
            stc.$tabsUl = $tabsContainer.find('.nav-tabs');

            // check for pills
            if (!stc.$tabsUl.length) {
                stc.$tabsUl = $tabsContainer.find('.nav-pills');

                if (stc.$tabsUl.length) {
                    stc.isNavPills = true;
                }
            }

            stc.$tabsLiCollection = stc.$tabsUl.find('> li');
            stc.$leftScrollArrow = $tabsContainer.find('.scrtabs-js-tab-scroll-arrow-left');
            stc.$rightScrollArrow = $tabsContainer.find('.scrtabs-js-tab-scroll-arrow-right');
            stc.$scrollArrows = stc.$leftScrollArrow.add(stc.$rightScrollArrow);

            stc.$win = $(window);
        };

        p.setElementWidths = function () {
            var ehd = this,
            stc = ehd.stc;

            stc.containerWidth = stc.$tabsContainer.outerWidth();
            stc.winWidth = stc.$win.width();

            stc.scrollArrowsCombinedWidth = stc.$leftScrollArrow.outerWidth() + stc.$rightScrollArrow.outerWidth();

            ehd.setFixedContainerWidth();
            ehd.setMovableContainerWidth();
        };

        p.setEventListeners = function () {
            var ehd = this,
            stc = ehd.stc,
                evh = stc.eventHandlers; // eventHandlers

                stc.$leftScrollArrow.off('.scrtabs').on({
                    'click.scrtabs': function (e) { evh.handleClickOnLeftScrollArrow.call(evh, e); }
                });

                stc.$rightScrollArrow.off('.scrtabs').on({
                    'click.scrtabs': function (e) { evh.handleClickOnRightScrollArrow.call(evh, e); }
                });

                stc.$win.smartresize(function (e) { evh.handleWindowResize.call(evh, e); });

            };

            p.setFixedContainerWidth = function () {
                var ehd = this,
                stc = ehd.stc;

                stc.$fixedContainer.width(stc.fixedContainerWidth = stc.$tabsContainer.outerWidth());
            };

            p.setFixedContainerWidthForJustHiddenScrollArrows = function () {
                var ehd = this,
                stc = ehd.stc;

                stc.$fixedContainer.width(stc.fixedContainerWidth);
                stc.$tabsContainer.removeClass('scrtabs-tab-container--with-arrows');
            };

            p.setFixedContainerWidthForJustVisibleScrollArrows = function () {
                var ehd = this,
                stc = ehd.stc;

                stc.$fixedContainer.width(stc.fixedContainerWidth - stc.scrollArrowsCombinedWidth);
                stc.$tabsContainer.addClass('scrtabs-tab-container--with-arrows');
            };

            p.setMovableContainerWidth = function () {
                var ehd = this,
                stc = ehd.stc;

                stc.movableContainerWidth = 0;

                stc.$tabsUl.find('li').each(function __getLiWidth() {
                    var $li = $(this),
                    totalMargin = 0;

                if (stc.isNavPills) { // pills have a margin-left, tabs have no margin
                    totalMargin = parseInt($li.css('margin-left'), 10) + parseInt($li.css('margin-right'), 10);
                }

                stc.movableContainerWidth += ($li.outerWidth() + totalMargin);
            });

                stc.$movableContainer.width(stc.movableContainerWidth += 1);
            };

            p.setScrollArrowVisibility = function () {
                var ehd = this,
                stc = ehd.stc,
                shouldBeVisible = stc.movableContainerWidth > stc.fixedContainerWidth;

                if (shouldBeVisible && !stc.scrollArrowsVisible) {
                    p.checkTabAligment(false, stc.$movableContainer);
                    stc.$scrollArrows.show();
                    stc.scrollArrowsVisible = true;
                    ehd.setFixedContainerWidthForJustVisibleScrollArrows();
                } else if (!shouldBeVisible && stc.scrollArrowsVisible) {
                    p.checkTabAligment(true, stc.$movableContainer);
                    stc.$scrollArrows.hide();
                    stc.scrollArrowsVisible = false;
                    ehd.setFixedContainerWidthForJustHiddenScrollArrows();
                }
            };

            p.checkTabAligment = function (state, element) {
                if(element.find('.swipe-tabs--left-aligned').length == 1) {
                    if(state) {
                        element.addClass('scrtabs-tabs-movable-container--left');
                    } else {
                        element.removeClass('scrtabs-tabs-movable-container--left');
                    }
                }
            };

        }(ElementsHandler.prototype));



    /* **********************************************************************
     * ScrollingTabsControl - Class that each directive will instantiate
     * **********************************************************************/
     function ScrollingTabsControl($tabsContainer, $timeout) {
        var stc = this;

        stc.$tabsContainer = $tabsContainer;
        stc.$timeout = $timeout;

        stc.scrollArrowsVisible = true;

        stc.eventHandlers = new EventHandlers(stc);
        stc.elementsHandler = new ElementsHandler(stc);
        stc.iScroll = new IScroll($tabsContainer.find('.scrtabs-tabs-fixed-container')[0], {eventPassthrough: true, scrollX: true, scrollY: false, preventDefault: false});
    }

    // prototype methods
    (function (p) {
        p.initTabs = function () {
            var stc = this,
            elementsHandler = stc.elementsHandler,
            iScroll = stc.iScroll;

            stc.$timeout(function __initTabsAfterTimeout() {
                elementsHandler.initElements();
                elementsHandler.refreshAllElementSizes();
                iScroll.refresh();
                elementsHandler.scrollToActiveTab();
            }, 100);
        };


    }(ScrollingTabsControl.prototype));


    /* ********************************************************
     * scrolling-tabs-wrapper Directive
     * ********************************************************/
     function scrollingTabsWrapperDirective($timeout) {
        // ------------ Directive Object ---------------------------
        return {
            restrict: 'A',
            template: scrollingTabsWrapperTemplate,
            transclude: true,
            replace: true,
            link: function(scope, element, attrs) {
                var scrollingTabsControl = new ScrollingTabsControl(element, $timeout);
                var elementsHandler = scrollingTabsControl.initTabs();
          
                scope.$watch('tabWatch', function(n,o) {
                    if (n!==o) {
                        $timeout(function() {
                            elementsHandler.refreshAllElementSizes();
                        }, 100);
                    }
                });

            }
        };
    }

scrollingTabsWrapperDirective.$inject = ['$timeout'];
scrollingTabsModule.directive('scrollingTabsWrapper', scrollingTabsWrapperDirective);

}());
