# Alloy UI plugins repository
 
## Liferay Infinite Scroll Asset Publisher :

This plugin allows you to load infinitly the assets antries using AJAX requests when the scroll is in the bottem, it install during its deployment an ADT that can be configured or modified independently to change the look and feel or the HTML structure, you can find also in the setup menu a set of parameters to adapt as needed this plugin, for example the possibility to modify the template items loaded via ajax, the height of the container or its css selector to change the look and feel, this plugin is based on the native parameters of the asset pulisher (number of items by default 5 in the page and metadata) in order to subsequently use the metadata in the alloy template of the item.

Installation instructions :
-------------

- In Liferay context put :

```
<header-portlet-javascript>/path_to_script/liferay-infinite-scroll/liferay-infinite-scroll.js</header-portlet-javascript>
```

- Load plugin :

```
<aui:script use="liferay-infinite-scroll">  
		
		new Liferay.InfiniteScroll(
			{
				itemTemplate: '<%= HtmlUtil.escapeJS(templateItem) %>',
				dataSourceURL: '<%= renderResponse.createResourceURL() %>',
				portletNamespace: '<%= portletDisplay.getNamespace() %>'
			}
		);
</aui:script>
```
