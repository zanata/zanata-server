# Merge translations from another project version

## Restrictions

- This features only available to project maintainers.
- Only translations that are in translated/approved state will be used.
- Merge translation can only be run if there's no other copy translations in progress for selected version. e.g. copy-trans/copy version.

** Rule of which translations will be copied over **
<table class='docutils'>
    <tr>
        <td>**From**</td><td>**To**</td><td>**Copy?**</td>
    </tr>
    <tr>
        <td>fuzzy/untranslated</td><td>any</td><td>No</td>
    </tr>
    <tr>
        <td>different source text/document id/locale</td><td>any</td><td>No</td>
    </tr>
    <tr>
        <td>translated/approved</td><td>untranslated/fuzzy</td><td>Yes</td>
    </tr>
     <tr>
        <td>translated/approved</td><td>translated/approved</td><td>copy if `From` is newer and `Keep existing translated/approved strings` is unchecked</td>
    </tr>
</table>
     
## Runs Merge translation

1. Login into Zanata.
1. Select a project version of which you wish to copy translations to.
1. Expend `More Action` menu on top right corner and click on `Merge Translations`. You need to be project maintainers for this action.
<figure>
    <img alt="More action menu in project version page" src="images/version-more-action-menu.png" />
</figure>
1. In displayed windows, select which project/version of translations that you wish to copy from.
<figure>
    <img alt="Merge translation windows" src="images/version-merge-trans-windows.png" />
</figure>
1. Check on `Keep existing translated/approved strings` if you don't want to replace existing translated/approved translations with newer translations from this source.
1. Click `Merge Translations` button to start process.
1. Progress bar will display in the version page during merge process.
<figure>
    <img alt="Merge translation in progress" src="images/version-merge-trans-progress.png" />
</figure>

## Cancel Merge translation
**_Note: This will leave this project version in an incomplete state where only partial translations been copied over.**

1. Go to progress bar section in project version page.
1. Click on `Cancel` button on top right panel.
<figure>
    <img alt="Cancel merge translation in progress" src="images/version-merge-trans-cancel.png" />
</figure>



