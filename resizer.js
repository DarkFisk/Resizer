(function(){

	// the minimum version of jQuery we want
	var v = "1.7.1";


	var Resizer = {
		$target: null,
		$container: null,
		$container_dropdown: null,
		dimensions: {},
		current_dimension: 'mobile',
		current_landscape: true,
		sizes_order: ['mobile', 'small_tablet', 'big_tablet', 'desktop'],
		sizes: {
			'mobile': {'order': 0, 'description': 'Mobile', 'width': 320, 'height': 480},
			'small_tablet': {'order': 1,'description': 'Small Tablet', 'width': 460, 'height': 640},
			'big_tablet': {'order': 2,'description': 'Big Tablet','width': 768, 'height': 1024},
			'desktop': {'order': 3,'description': 'Desktop', 'width': 1200, 'height': 800}
		},
		init: function(){
			Resizer.loadCss();
			Resizer.$target = jQuery('body');
			Resizer.dimensions.height = Resizer.$target.height();
			Resizer.dimensions.width = Resizer.$target.width();
			Resizer.$container = jQuery('<div id="responsive_resize_container"></div>').appendTo('body');
			jQuery('<div class="resize_inner"><a class="resizer_bigger" href="#">+</a><a class="resizer_smaller" href="#">-</a><a class="resize_drop_selector" href="#"><span class="resizer_active_dimension">Mobile <span class="resizer_dimension">(320x480)</span></span></a><ul class="resize_dropdown"></ul><a class="toggle_orientation" href="#">Toggle Orientation</a><a class="reload" href="#">Reload</a><a class="reset" href="#">Reset</a></div>').appendTo(Resizer.$container);
			Resizer.$container_dropdown = jQuery('ul.resize_dropdown', Resizer.$container);
			jQuery.each(Resizer.sizes, function(index, value){
				jQuery('<li data-dimension="'+ index +'" data-description="'+ value.description +'" data-height="'+ value.height +'" data-width="'+ value.width +'"><a href="#">'+ value.description +'</a></li>').appendTo(Resizer.$container_dropdown);
			});
			jQuery('a.resize_drop_selector').click(function(e){
				Resizer.$container_dropdown.show();
				// close dropdown on click anywhere on the page
				window.setTimeout(function(){
					jQuery(document).one('click', function(e){
						Resizer.$container_dropdown.hide();
					});
				}, 1);

				e.preventDefault();
			});

			jQuery('a.resizer_smaller', Resizer.$container).click(function(e){
				Resizer.smaller();
				e.preventDefault();
			});
			jQuery('a.resizer_bigger', Resizer.$container).click(function(e){
				Resizer.bigger();
				e.preventDefault();
			});

			jQuery('a.reset', Resizer.$container).click(function(e){
				Resizer.reset();
				e.preventDefault();
			});

			jQuery('a.reload', Resizer.$container).click(function(e){
				Resizer.reload();
				e.preventDefault();
			});

			jQuery('a.toggle_orientation', Resizer.$container).click(function(e){
				Resizer.toggleOrientation();
				e.preventDefault();
			});

			jQuery('li a', Resizer.$container_dropdown).click(function(e){
				$data = jQuery(this).parent().data();
				Resizer.$container_dropdown.hide();
				Resizer.current_dimension = $data.dimension;
				Resizer.resize($data.width, $data.height);
				e.preventDefault();
			});
		},


		//resize the window size to selected size
		resize: function(width, height){
			var next_width = Resizer.current_landscape ? height : width,
				next_height = Resizer.current_landscape ? width : height;

			jQuery('#resizer_resize_wrapper').remove();
			$wrapper = jQuery('<div id="resizer_resize_wrapper"></div>').appendTo(Resizer.$target);
			jQuery('<iframe />', {
				name: 'resizer_frame',
				id:   'resizer_frame',
				class: 'resizer_active',
				src: window.location + '?123',
				frameborder: '0',
				sandbox: 'allow-same-origin allow-form'

			}).appendTo($wrapper).animate({'width': next_width, 'height': next_height}, {easing: 'linear', duration: 200, queue: false}).addClass('resizer_active')
			.wrap('<div id="resize_wrapper_inner"/>')
			.parent().css({'width': next_width, 'height': next_height});

			jQuery('.resizer_active_dimension').html(  Resizer.sizes[Resizer.current_dimension].description +' <span class="resizer_dimension">('+ next_width +'x'+ next_height +')</span>');


		},
		//reset window to original size
		reset: function(){
			jQuery('#resizer_resize_wrapper').remove();
		},

		//reload current url inside of the iframe - avoid having to refresh and reinitialize bookmarklet while developing a site
		reload: function(){
			jQuery('#resizer_frame').attr('src', window.location + '?' + Math.floor(Math.random()*11));
		},
		// toogle the orientation between landscape and portrait mode
		toggleOrientation: function(){
			var width = Resizer.sizes[Resizer.current_dimension].width,
				height = Resizer.sizes[Resizer.current_dimension].height;

			Resizer.current_landscape = !Resizer.current_landscape;
			Resizer.resize(width, height);
		},
		//increase the window size to the next largest resolution available
		bigger: function(){
			if(Resizer.current_dimension != 'desktop'){
				current_order = Resizer.sizes[Resizer.current_dimension].order;
				next_dimension = Resizer.sizes[Resizer.sizes_order[current_order + 1]];
				dimensions = {width: next_dimension.width, height: next_dimension.height};
				Resizer.current_dimension = Resizer.sizes_order[next_dimension.order];
				Resizer.resize(dimensions.width, dimensions.height);
			}
		},
		//decrease the window size to the previous smaller resolution available
		smaller: function(){
			current_order = Resizer.sizes[Resizer.current_dimension].order;
			if(Resizer.current_dimension != 'mobile'){
				next_dimension = Resizer.sizes[Resizer.sizes_order[current_order - 1]];
				dimensions = {width: next_dimension.width, height: next_dimension.height};
				Resizer.current_dimension = Resizer.sizes_order[next_dimension.order];
				Resizer.resize(dimensions.width, dimensions.height);
			}

		},
		loadCss: function(){
			if(jQuery('head link#responsive_css') != null){
				jQuery('<link>',{
					href: 'http://codebomber.com/jquery/resizer/resizer.min.css',
					rel: 'stylesheet',
					id: 'responsive_css'
				}).appendTo('head');
			}
		}


	};

	// check prior inclusion and version
	if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
		var done = false;
		var script = document.createElement("script");
		script.src = "//ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js";
		script.onload = script.onreadystatechange = function(){
			if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				done = true;
				Resizer.init();
			}
		};
		document.getElementsByTagName("head")[0].appendChild(script);
	} else {
		Resizer.init();
	}

})();
