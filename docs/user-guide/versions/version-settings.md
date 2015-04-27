Once a version has been created, the maintainer can add further details and version behaviour via the Settings tab.
See the [Version Creation Help](user-guide/versions/create-version) for details on creating version.
<figure>
<img alt="Version General Settings tab" src="images/version-settings-button.png" />
<figcaption>Versions Settings tab link.</figcaption>
</figure>

------------

## General Settings

<figure>
<img alt="Version General Settings tab" src="images/version-general-settings.png" />
<figcaption>Version General Settings tab</figcaption>
</figure>
<br>

### Project Type

Project Type settings by default inherits from project's settings but maintainer are able to define different project type for version. See [Project Types](user-guide/projects/project-types) and [Project Settings](user-guide/projects/project-settings/#project-type) for more information.

### Make this version read only

This button is used to set a version to read-only, which prevents translations being entered. This may be useful in some cases, but should be used sparingly so that translators are able to work on your project.

This can be toggled using the same button, as desired.

------------

## Documents Settings

<figure>
<img alt="Version Documents Settings tab" src="/images/version-documents-settings.png" />
<figcaption>Version Documents Settings tab</figcaption>
</figure>

------------

### Adding source document

Click `+` sign on top left in Documents tab under Settings. Browse or Drag your documents into the dialog and click `Upload Documents`.

------------

## Languages Settings

<figure>
<img alt="Version Languages Settings tab" src="/images/version-languages-settings.png" />
<figcaption>Version Languages Settings tab</figcaption>
</figure>

------------

### Customized locales

By default, your project will be available for translation to a set of locales defined for your project, or on the Zanata server if your project does not have customized locales. If your version requires a different set of locales from your project, click `Enable` or `Disable` button on right side of the locale.

------------

## Translation Settings

<figure>
<img alt="Version Translation Settings tab" src="images/version-translation-settings.png" />
<figcaption>Version Translation Settings tab</figcaption>
</figure>

------------
### Require translation review

Translation review is an optional stage in the translation process in which an experienced translator can check that translations are of sufficient quality.

Without translation review, translators will save translations in the 'translated' state, making them immediately available to download and use for your project.

If you check the `Require translation review` option, translations in the 'translated' state are not considered ready for download. Instead, a reviewer must look at the translations and change them to 'approved' or 'rejected' state. Only translations in 'approved' state are considered ready for download.

Translation review adds extra time and effort to the translation process, so is not recommended for all projects. Translation review can be activated at a later time if it becomes necessary.

### Customized list of validations

If your version requires a different set of validations than the parent project, they can be selected here. If customized validations are not specified, the validations specified for your project will be used. An advantage of inheriting validations from the poject is that new validations can be added to the project without having to add them to each different version.

For more information, see [Project settings](user-guide/projects/project-settings#validations).
