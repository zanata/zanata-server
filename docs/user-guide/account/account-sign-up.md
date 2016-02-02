# Signing Up


You can create an account on Zanata using an OpenID login (such as Fedora), Yahoo, or by creating a password specific to Zanata. You can set or change your password and add OpenID accounts to your Zanata account at any time. 

Zanata team hosts following servers:
 * [fedora.zanata.org](https://fedora.zanata.org) - For [Fedora](https://getfedora.org/)-releated projects. 
 * [translate.jboss.org](https://translate.jboss.org) - For [JBoss](http://www.jboss.org/)-releated projects
 * [translate.zanata.org](https://translate.zanata.org) - Generic open source projects 

Press `Sign up` to start registration.

Fedora and JBoss have their own account systems. 
After pressing `Sign up`, Zanata will bring you to corresponding registration pages.
You will need to follow the instructions on screen to complete sign up process.

## Signing up in translate.zanata.org

In translate.zanata.org, you can sign up with Fedora, Yahoo, Open ID, or Zanata itself.

### Sign up with Fedora

 1. Click `Fedora` in Sign Up page.
 2. Follow the on-screen instructions. You can either use existing Fedora account, or register a new Fedora account.
 3. Complete the `Name`, `Username`, and `Email` fields. Ensure your email address is entered correctly.
 4. Click `Save`. This sends a validation email to the address you entered in the previous step.
 5. Open the validation email and click the validation link.

You can now sign in to Zanata using your Fedora credentials.

### Sign up with Yahoo

 1. Click `Yahoo` in Sign Up page.
 2. Follow the on-screen instructions. You can either use existing Yahoo account, or register a new Yahoo account.
 3. Complete the `Name`, `Username`, and `Email` fields. Ensure your email address is entered correctly.
 4. Click `Save`. This sends a validation email to the address you entered in the previous step.
 5. Open the validation email and click the validation link.

You can now sign in to Zanata using your Yahoo credentials.
 
### Sign up with Generic OpenID

Go to the OpenID service provider to obtain your open ID.
For example, [Open ID Support WordPress.com](https://en.support.wordpress.com/settings/openid/) shows how to use WordPress.com as OpenID provider.

 1. Login to your OpenID provider on other browser window or tab.
    For some OpenID provider (e.g. wordpress.com), this step is mandatory.
 2. Fill the OpenID and click `Go`
 3. Follow the instruction to grant Zanata to use your openID.
 4. Complete the `Name`, `Username`, and `Email` fields. Ensure your email address is entered correctly.
 5. Click `Save`. This sends a validation email to the address you entered in the previous step.
 6. Open the validation email and click the validation link.

<figure>
   ![Account sign up OpenID](/images/account-signup-openid-details.png)
</figure>

You can now sign in to Zanata using your OpenID credentials.


### Sign up with Zanata itself (Internal Authentication)

If you do not have any other accounts, follow these steps:

 1. Complete the `Name`, `Username`, and `Email` and `Password` field.
 2. Click `Sign Up`. This sends a validation email to the address you entered in the previous step.
 3. Open the validation email and click the validation link.

You can now sign in to Zanata using your Zanata credentials.

### Adding a Password for Direct Zanata Login 

Even you sign up with third party authentication (e.g. Fedora, Yahoo, OpenID),
you can still login to Zanata when the third party failed.

To setup the password for direct Zanata login, click `Change Password` under your profile settings and enter the desired password.


## Adding OpenID Accounts to Your Zanata Account

You can add OpenID accounts to your Zanata account after it is created. You can have several different accounts linked to the same Zanata account and sign in with any of them.

To add an OpenID account to your Zanata account:

 1. Click the profile avatar at the upper right of the page to display the menu pane.
 2. Click `Settings` and then click `Manage Identities`.
 3. In the `Actions` menu, click `Add New Identity` and follow the procedure described earlier.

*Note: if you want to translate a project that falls under the Fedora CLA, you must add a Fedora OpenID to your Zanata account. You can then sign in with your password or any OpenID account and be allowed to translate Fedora projects.*

