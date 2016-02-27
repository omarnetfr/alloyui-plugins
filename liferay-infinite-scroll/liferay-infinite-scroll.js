/**
 * 
 * Copyright (c) 2016 Omar HADDOUCHI All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 * 
 * @author Omar HADDOUCHI
 * 
 */

AUI.add(
	'liferay-infinite-scroll',
	function(A) {
	    
	    var Lang = A.Lang,
			NAME = 'infinitescroll';
	    
	    var DEFAULT_TPL_ITEM = new A.Template(
    		'<li class="asset-item">',
    			'<div class="asset-item-body">',
    				'<strong>{entryTitle}</strong> <br> ',
    				'<small class="asset-item-date">{publishDate}</small>',
    				'<div class="well asset-item-summary">{summary}</div>',
    				'<div class="pull-right">',
    					'<a class="btn btn-xs btn-white" href="{viewURL}"> ' + Liferay.Language.get("read-more") + '<span class="hide-accessible">' + Liferay.Language.get('about') + '{entryTitle}</span> &raquo; </a>',
    				'</div>',
    			'</div>',
    		'</li>'
    	);
	    
	    var STR_DATA = 'responseData';
	    
	    var InfiniteScroll = A.Component.create(
			{
				ATTRS: {
					defaultHeight: {
						value: 400
					},
		            defaultContainerSelector: {
		                value: '.infinite-scroll-container'
		            },
		            defaultOffset: {
		                value: 0
		            },
		            defaultScrollBufferSize: {
		                value: 60
		            }, 
		            debugModeDefault : {
		            	value: false
		            }
		        },
		        
				EXTENDS: A.Base,
				
				NAME: NAME,
				
				prototype: {
					initializer: function(config) {
						
						var instance = this;
						
						instance._height = config.height || instance.get('defaultHeight');
						instance._currentOffset = config.defaultOffset || instance.get('defaultOffset');
						instance._containerSelector = config.containerSelector || instance.get('defaultContainerSelector');
						instance._scrollBufferSize = config.scrollBufferSize || instance.get('defaultScrollBufferSize');
						instance._debugMode = config.debugMode || instance.get('debugModeDefault');
						instance._dataSourceURL = config.dataSourceURL;
						instance._portletNamespace = config.portletNamespace;
						instance._itemTemplate = new A.Template(config.itemTemplate) || DEFAULT_TPL_ITEM;
						
						instance._allContentLoaded = false;

						instance._updateInprogress = false;
						
						if (instance._debugMode) {
							console.log('initializer -> config : ');
							console.log(config);
							console.log('initializer -> instance : ');
							console.log(instance);
						}
						
						if (A.one(instance._containerSelector)) {
							
							instance._containerEl = A.one(instance._containerSelector);

							var styles = {
								height: instance._height,
								overflow: 'auto'
							};
							
							//styles = A.mix (styles, config.styles, true);
							
							instance._containerEl.setStyles(styles);
	
							instance._containerEl.on('scroll', A.bind('_onScroll', instance));
						}
					},
					_onScroll: function() {
						
						var instance = this;
						
						if (instance._updateInprogress) {
							return;
						}
						
						var scrollHeight = instance._containerEl.getDOM().scrollHeight, 
							clientHeight = instance._containerEl.getDOM().clientHeight,
							scrollTop = instance._containerEl.getDOM().scrollTop;
						
						if ( (scrollHeight - (scrollTop + clientHeight) < instance._scrollBufferSize) && !instance._allContentLoaded) {
							
							instance._updateInprogress = true;
							
							scrollTop += instance._scrollBufferSize;
							
							if (instance._debugMode) {
								console.log('_onScroll -> _requestItems');
							}

							// request items
							instance._requestItems();
						}
					},
					_requestItems: function() {
						
						var instance = this,
							lang = A.Lang;
						
						var start = instance._containerEl.all('li').size();
						
						if ( !instance._containerEl.loadingmask) {
							instance._containerEl.plug(A.LoadingMask);
						}
						
						instance._containerEl.loadingmask.show();
						
						var uri = instance._dataSourceURL;

						A.io.request(
							uri,
							{
								data: Liferay.Util.ns(
									instance._portletNamespace, {
										'start': start
									}
								),
								after: {
									success: function(event, id, obj) {
										
										var reponse = this.get(STR_DATA);
										
										var items = reponse.items;
										
										if (instance._debugMode) {
											console.log('_requestItems -> success');
										}
										
										if (items.length == 0) {
											instance._allContentLoaded = true;
										} else {
											A.each(
												items,
												function(item, index, collection) {
													
													instance._renderItemUI(item);
												}
											);
											
											instance._allContentLoaded = reponse.allContentLoaded;
										}
										
										instance._containerEl.loadingmask.hide();

										instance._updateInprogress = false;
									}
								},
								dataType: 'json'
							}
						);
					},
					_renderItemUI: function(item) {
						
						var instance = this;
						
						var item = instance._itemTemplate.render(
							{
								entryTitle: item.entryTitle,
								publishDate: item.publishDate,
								expirationDate: item.expirationDate,
								summary: item.summary,
								viewURL: item.viewURL
							}
						);

						instance._containerEl.append(item);
					}
				}
			}
		);
	    
	    Liferay.InfiniteScroll = InfiniteScroll;
	},
	'',
	{
		requires: ['aui-base', 'aui-modal', 'aui-io-request', 'aui-parse-content', 'aui-template-deprecated', 'aui-loading-mask', 'aui-loading-mask-deprecated', 'liferay-portlet-url']
	}
);