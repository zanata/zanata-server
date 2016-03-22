import { Schema, arrayOf } from 'normalizr'

// Read more about Normalizr: https://github.com/gaearon/normalizr

export const GLOSSARY_TERM = new Schema('glossaryTerms')
export const GLOSSARY_TERM_ARRAY = arrayOf(GLOSSARY_TERM)

export const PROJECT = new Schema('project')
export const PROJECT_ARRAY = arrayOf(PROJECT)
export const LANGUAGE_TEAM = new Schema('languageTeam')
export const LANGUAGE_TEAM_ARRAY = arrayOf(LANGUAGE_TEAM)
export const PERSON = new Schema('person')
export const PERSON_ARRAY = arrayOf(PERSON)

const SEARCH_TYPES = {
  PROJECT,
  LANGUAGE_TEAM,
  PERSON
}

export const SEARCH_RESULTS = arrayOf(SEARCH_TYPES, { schemaAttribute: 'type' })
