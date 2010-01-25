package org.fedorahosted.flies.webtrans.client;

import net.customware.gwt.dispatch.client.DispatchAsync;
import net.customware.gwt.presenter.client.EventBus;
import net.customware.gwt.presenter.client.place.Place;
import net.customware.gwt.presenter.client.place.PlaceRequest;
import net.customware.gwt.presenter.client.widget.WidgetDisplay;
import net.customware.gwt.presenter.client.widget.WidgetPresenter;

import org.fedorahosted.flies.common.LocaleId;
import org.fedorahosted.flies.gwt.model.ProjectContainerId;
import org.fedorahosted.flies.gwt.rpc.ActivateWorkspaceAction;
import org.fedorahosted.flies.gwt.rpc.ActivateWorkspaceResult;
import org.fedorahosted.flies.gwt.rpc.ExitWorkspaceAction;
import org.fedorahosted.flies.gwt.rpc.ExitWorkspaceResult;
import org.fedorahosted.flies.webtrans.client.Application.WindowResizeEvent;
import org.fedorahosted.flies.webtrans.client.LoginPresenter.LoggedIn;
import org.fedorahosted.flies.webtrans.client.auth.Identity;
import org.fedorahosted.flies.webtrans.client.rpc.CachingDispatchAsync;
import org.fedorahosted.flies.webtrans.editor.WebTransEditorPresenter;

import com.allen_sauer.gwt.log.client.Log;
import com.google.gwt.event.logical.shared.CloseEvent;
import com.google.gwt.event.logical.shared.CloseHandler;
import com.google.gwt.event.logical.shared.ResizeEvent;
import com.google.gwt.event.logical.shared.ResizeHandler;
import com.google.gwt.user.client.Command;
import com.google.gwt.user.client.DeferredCommand;
import com.google.gwt.user.client.Window;
import com.google.gwt.user.client.rpc.AsyncCallback;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.PopupPanel;
import com.google.gwt.user.client.ui.Widget;
import com.google.inject.Inject;

public class AppPresenter extends WidgetPresenter<AppPresenter.Display> {
	
	public interface Display extends WidgetDisplay {
		public void setWest(Widget west);
		public void setMain(Widget main);
		public void setNorth(Widget north);
		public void setSouth(Widget south);
	}
	
	private final WestNavigationPresenter westNavigationPresenter;
	private final WebTransEditorPresenter webTransEditorPresenter;
	private final TopMenuPresenter topMenuPresenter;
	private final SouthPresenter southPresenter;
	private final EventProcessor eventProcessor;
	private final LoginPresenter loginPresenter;
	private final DispatchAsync dispatcher;
	private String workspaceName;
	private String localeName;
	private final Identity identity;
	
	@Inject
	public AppPresenter(Display display, EventBus eventBus,
			    CachingDispatchAsync dispatcher,
				final WestNavigationPresenter leftNavigationPresenter,
				final WebTransEditorPresenter webTransEditorPresenter,
				final TopMenuPresenter topMenuPresenter,
				final SouthPresenter southPresenter,
				final EventProcessor eventProcessor,
				final LoginPresenter loginPresenter,
				final Identity identity) {
		super(display, eventBus);
		this.identity = identity;
		this.dispatcher = dispatcher;
		this.westNavigationPresenter = leftNavigationPresenter;
		this.webTransEditorPresenter = webTransEditorPresenter;
		this.topMenuPresenter = topMenuPresenter;
		this.southPresenter = southPresenter;
		this.eventProcessor = eventProcessor;
		this.loginPresenter = loginPresenter;
	}

	@Override
	public Place getPlace() {
		return null;
	}

	protected void bindApp() {
		westNavigationPresenter.bind();
		webTransEditorPresenter.bind();
		topMenuPresenter.bind();
		southPresenter.bind();
		
		display.setNorth(topMenuPresenter.getDisplay().asWidget());
		Widget south = southPresenter.getDisplay().asWidget();
//		south.setHeight("15em");
		display.setSouth(south);
		display.setWest(westNavigationPresenter.getDisplay().asWidget());
		Widget mainWidget = webTransEditorPresenter.getDisplay().asWidget();
//		mainWidget.setHeight("100%");
		display.setMain(mainWidget);
		// TODO refactor to presenter
		
		registerHandler(
			eventBus.addHandler(WindowResizeEvent.getType(), new ResizeHandler() {
				@Override
				public void onResize(ResizeEvent event) {
					display.asWidget().setHeight(event.getHeight() + "px");
					display.asWidget().setWidth(event.getWidth() + "px");
				}
			})
		);
		
		registerHandler(
			eventBus.addHandler(NotificationEvent.getType(), new NotificationEventHandler() {
				
				@Override
				public void onNotification(NotificationEvent event) {
					PopupPanel popup = new PopupPanel(true);
					popup.addStyleDependentName("Notification");
					popup.addStyleName("Severity-"+ event.getSeverity().name());
					Widget center = webTransEditorPresenter.getDisplay().asWidget();
					popup.setWidth(center.getOffsetWidth()-40 + "px");
					popup.setWidget(new Label(event.getMessage()));
					popup.setPopupPosition(center.getAbsoluteLeft()+20, center.getAbsoluteTop()+30);
					popup.show();
				}
			})
		);
		
		//When user close the workspace, send ExitWorkSpaceAction
		Window.addCloseHandler(new CloseHandler<Window>() {
			@Override
			public void onClose(CloseEvent<Window> event) {
				dispatcher.execute(new ExitWorkspaceAction(findProjectContainerId(),findLocaleId(),identity.getPerson().getId()), new AsyncCallback<ExitWorkspaceResult>() {
					@Override
					public void onFailure(Throwable caught) {
						
					}
					@Override
					public void onSuccess(ExitWorkspaceResult result) {
							identity.invalidate();
					}
	
			});	
			}
		});

		// Hook the window resize event, so that we can adjust the UI.
		Window.addResizeHandler( new ResizeHandler() {
			@Override
			public void onResize(ResizeEvent event) {
				eventBus.fireEvent( new WindowResizeEvent(event));
			}
		});

		Window.enableScrolling(false);
		Window.setMargin("0px");
		
		
		
		// Call the window resized handler to get the initial sizes setup. Doing
		// this in a deferred command causes it to occur after all widgets'
		// sizes
		// have been computed by the browser.
		DeferredCommand.addCommand(new Command() {
			public void execute() {
				eventBus.fireEvent( new WindowResizeEvent(Window.getClientWidth(), Window
						.getClientHeight()));
			}
		});
		
		
	}
	
	private static LocaleId findLocaleId() {
		String localeId = Window.Location.getParameter("localeId");
		return localeId == null ? null : new LocaleId(localeId);
	}
	
	private static ProjectContainerId findProjectContainerId() {
		String projContainerId = Window.Location.getParameter("projContainerId");
		if(projContainerId == null)
			return null;
		try{
			int id = Integer.parseInt(projContainerId);
			return new ProjectContainerId(id);
		}
		catch(NumberFormatException nfe){
			return null;
		}
	}
	
	@Override
	protected void onBind() {
		loginPresenter.bind();
		loginPresenter.ensureLoggedIn(new LoggedIn() {
			@Override
			public void onSuccess() {
//				eventProcessor.addCallback(new AsyncCallback<Void>() {
//					
//					@Override
//					public void onSuccess(Void result) {

						
						
						Log.info("AppPresenter ActivateWorkspace requested");
						
						dispatcher.execute(new ActivateWorkspaceAction(findProjectContainerId(), findLocaleId()), new AsyncCallback<ActivateWorkspaceResult>() {
							@Override
							public void onFailure(Throwable caught) {
								loginPresenter.bind();
								loginPresenter.ensureLoggedIn(new LoggedIn() {
									@Override
									public void onSuccess() {
//										dispatcher.execute(new ActivateWorkspaceAction(findProjectContainerId(), findLocaleId()), new AsyncCallback<ActivateWorkspaceResult>() {
//											@Override
//											public void onFailure(Throwable caught) {
//											}
//											@Override
//											public void onSuccess(ActivateWorkspaceResult result) {
//												setWorkspaceName(result.getWorkspaceName());
//												setLocaleName(result.getLocaleName());
												bindApp();
//											}
//										});
									}
								});
							}
							@Override
							public void onSuccess(ActivateWorkspaceResult result) {
								Log.info("AppPresenter ActivateWorkspace - success");
								setWorkspaceName(result.getWorkspaceName());
								setLocaleName(result.getLocaleName());
								bindApp();
							}
						});
						
						
						
						
					}
					
//					@Override
//					public void onFailure(Throwable caught) {
//						// nil
//					}
//				});
//				
//			}
		});
	}

	private void setWorkspaceName(String workspaceName) {
		this.workspaceName = workspaceName;
	}
	
	public String getWorkspaceName() {
		return workspaceName;
	}
	
	private void setLocaleName(String localeName) {
		this.localeName = localeName;
	}
	
	public String getLocaleName() {
		return localeName;
	}

	@Override
	protected void onPlaceRequest(PlaceRequest request) {
	}

	@Override
	protected void onUnbind() {
		westNavigationPresenter.unbind();
		webTransEditorPresenter.unbind();
	}

	@Override
	public void refreshDisplay() {
	}

	@Override
	public void revealDisplay() {
	}
}
