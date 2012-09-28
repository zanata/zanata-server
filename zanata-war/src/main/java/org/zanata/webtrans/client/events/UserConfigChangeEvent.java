package org.zanata.webtrans.client.events;

import com.google.gwt.event.shared.GwtEvent;

public class UserConfigChangeEvent extends GwtEvent<UserConfigChangeHandler>
{
   public static final UserConfigChangeEvent EVENT = new UserConfigChangeEvent();
   /**
    * Handler type.
    */
   private static Type<UserConfigChangeHandler> TYPE;

   private UserConfigChangeEvent()
   {
   }

   /**
    * Gets the type associated with this event.
    * 
    * @return returns the handler type
    */
   public static Type<UserConfigChangeHandler> getType()
   {
      if (TYPE == null)
      {
         TYPE = new Type<UserConfigChangeHandler>();
      }
      return TYPE;
   }

   @Override
   protected void dispatch(UserConfigChangeHandler handler)
   {
      handler.onUserConfigChanged(this);
   }

   @Override
   public Type<UserConfigChangeHandler> getAssociatedType()
   {
      return getType();
   }

}