import { Schema, arrayOf } from 'normalizr'

// We use this Normalizr schemas to transform API responses from a nested form
// to a flat form where repos and users are placed in `entities`, and nested
// JSON objects are replaced with their IDs. This is very convenient for
// consumption by reducers, because we can easily build a normalized tree
// and keep it updated as we fetch more data.

// Read more about Normalizr: https://github.com/gaearon/normalizr

const projectSchema = new Schema('project')
const languageTeamSchema = new Schema('languageTeam')
const personSchema = new Schema('person')
const glossaryTerm = new Schema('glossaryTerms')
// const searchResultsSchema = new Schema('searchResults')

const searchTypes = {
  Project: projectSchema,
  LanguageTeam: languageTeamSchema,
  Person: personSchema
}

// Schemas for Github API responses.
export const Schemas = {
  GLOSSARY_TERM: glossaryTerm,
  GLOSSARY_TERM_ARRAY: arrayOf(glossaryTerm),
  LANGUAGE_TEAM: languageTeamSchema,
  LANGUAGE_TEAM_ARRAY: arrayOf(languageTeamSchema),
  PEOPLE: personSchema,
  PEOPLE_ARRAY: arrayOf(personSchema),
  PROJECT: projectSchema,
  PROJECT_ARRAY: arrayOf(projectSchema),
  SEARCH_RESULTS: arrayOf(searchTypes, { schemaAttribute: 'type' })
}
