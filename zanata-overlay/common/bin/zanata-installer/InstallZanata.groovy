import groovy.xml.XmlUtil

/**
 * Zanata installer script.
 * Downloads Zanata and configures certain parts of the application for first
 * use.
 * @author Carlos Munoz <a href="mailto:camunoz@redhat.com">camunoz@redhat.com</a>
 */
Properties installerProps = new Properties()
File propertiesFile = new File('installer.properties')
propertiesFile.withInputStream {
    installerProps.load(it)
}
def ZANATA_VERSION = installerProps['zanata.version']
final DS_FILE_LOC = "../../standalone/configuration/standalone-zanata.xml"
final WAR_FILE_LOC = "../../standalone/deployments/zanata.war"

if( new File(WAR_FILE_LOC).exists() ) {
    println "It seems Zanata is already installed. If you wish to upgrade Zanata " +
        "you need to download a more recent web archive file and drop it in the " +
        "standalone/deployments directory of your Zanata server installation."
    return
}

println "====================================================="
println " Welcome to the Zanata Installer. This will install"
println " Zanata ${ZANATA_VERSION} onto your JBoss or Wildfly"
println "====================================================="

def dbHost
def dbPort
def dbSchema
def dbUsername
def dbPassword

println "Please provide the following information:"
println "(If blank, the default value will apply)"
println ""

System.in.withReader { reader ->

    println "Database Host (default: 'localhost'): "
    dbHost = reader.readLine()
    if(dbHost.isEmpty()) dbHost = 'localhost'

    println "Database port (default: '3306'): "
    dbPort = reader.readLine()
    if(dbPort.isEmpty()) dbPort = '3306'

    println "Database schema (default: 'zanata'): "
    dbSchema = reader.readLine()
    if(dbSchema.isEmpty()) dbSchema = 'zanata'

    println "Database Username (default: ''): "
    dbUsername = reader.readLine()

    println "Database Password: (default: '')"
    dbPassword = reader.readLine()
}

def fileUrl = "http://sourceforge.net/projects/zanata/files/webapp/zanata-war-${ZANATA_VERSION}.war/download"
println "Downloading $fileUrl"
println "This might take a few minutes."

try {
    def file = new FileOutputStream(WAR_FILE_LOC)
    def out = new BufferedOutputStream(file)
    out << new URL(fileUrl).openStream()
    out.close()
} catch (Exception ex) {
    println "Could not download zanata-war-${ZANATA_VERSION}.war"
}

// Update zanata datasource
def dsXml = new XmlParser().parse(DS_FILE_LOC)

def zanataDs =
    dsXml.profile.subsystem.find { s -> s.datasources }.datasources.datasource
        .find { it.@'jndi-name' == "java:jboss/datasources/zanataDatasource" }

zanataDs.'connection-url'.replaceNode {
    'connection-url'( "jdbc:mysql://${dbHost}:${dbPort}/${dbSchema}?characterEncoding=UTF-8" )
}
zanataDs.security.replaceNode { node ->
    security {
        'user-name'( dbUsername )
        password( dbPassword )
    }
}

println XmlUtil.serialize(dsXml, new FileOutputStream(DS_FILE_LOC))
