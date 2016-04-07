Zanata
=====

Zanata is a web-based system for translators to translate
documentation and software online using a web-browser. It is
written in Java and uses modern web technologies like JBoss,
Seam, GWT, Hibernate, and a REST API. It currently supports
translation of DocBook/Publican documentation through PO
files. Projects can be uploaded to and downloaded from a Zanata
server using a Maven plugin or a Python client.

For *developers and writers*: By using Zanata for
your document translations, you can open up your project for
translations without opening your entire project in version
control.

For *translators*: No need to deal with PO files,
gettext or a version control system - just log in to the website, join
a language team and start translating, with translation memory (history
of similar translations) and the ability to see updates from other
translators in seconds.


Zanata is Free software, licensed under the [LGPL][].

[LGPL]: http://www.gnu.org/licenses/lgpl-2.1.html

Developers
----------

You can use one of the scripts to build the project using maven:

[`etc/scripts/quickbuild.sh`](etc/scripts/quickbuild.sh) - Builds the project as quickly as possible, targeting all
browsers in the GWT components, and skipping all checks and verifications (i.e.
tests, checkstyle, etc)

If you wish to build GWT componets for chrome or firefox, you can specify the
`-c` and `-f` arguments respectively.

The `-f` argument prints the script's help.

[`etc/scripts/cargowait.sh`](etc/scripts/cargowait.sh) - Builds the Zanata artifact and starts a JBoss server using the
cargo plugin. This script is particularly useful for quickly starting a Zanata
instance, and for running functional tests from an IDE.
