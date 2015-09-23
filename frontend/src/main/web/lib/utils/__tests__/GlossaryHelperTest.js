jest.dontMock('../GlossaryHelper')
  .dontMock('lodash');

describe('GlossaryHelperTest', function() {

  var GlossaryHelper;
  var _ = require('lodash');

  beforeEach(function() {
    GlossaryHelper = require('../GlossaryHelper');
  });

  it('test can update translation comment', function() {
    var entry = {transTerm: {content: null}};
    expect(GlossaryHelper.canUpdateTransComment(entry)).toEqual(false);

    var entry = {transTerm: {content: undefined}};
    expect(GlossaryHelper.canUpdateTransComment(entry)).toEqual(false);

    var entry = {transTerm: {content: 'some content'}};
    expect(GlossaryHelper.canUpdateTransComment(entry)).toEqual(true);
  });

  it('test is source term valid', function() {
    var entry = {srcTerm: {content: null}};
    expect(GlossaryHelper.isSourceValid(entry)).toEqual(false);

    var entry = {srcTerm: {content: undefined}};
    expect(GlossaryHelper.isSourceValid(entry)).toEqual(false);

    var entry = {srcTerm: {content: 'some content'}};
    expect(GlossaryHelper.isSourceValid(entry)).toEqual(true);
  });

  it('test get term by locale', function() {
    var term1 = {
      "content": "process",
      "locale": "en-US",
      "lastModifiedDate": 1439435990000,
      "lastModifiedBy": ""
    };
    var term2 = {
      "content": "process",
      "locale": "de",
      "lastModifiedDate": 1439435990000,
      "lastModifiedBy": ""
    };
    var term3 = {
      "content": "process",
      "locale": "fr",
      "lastModifiedDate": 1439435990000,
      "lastModifiedBy": ""
    };

    var terms = [term1, term2, term3];
    var localeId = 'en-US';
    expect(GlossaryHelper.getTermByLocale(terms, localeId)).toEqual(term1);

    localeId = 'de';
    expect(GlossaryHelper.getTermByLocale(terms, localeId)).toEqual(term2);

    localeId = 'fr';
    expect(GlossaryHelper.getTermByLocale(terms, localeId)).toEqual(term3);

    localeId = 'non-exist';
    expect(GlossaryHelper.getTermByLocale(terms, localeId)).toEqual(null);
  });

  it('test generate term dto', function() {
    var data = {content: 'content', locale: 'de', comment: 'comment'};
    var term = GlossaryHelper.generateGlossaryTermDTO(data);
    expect(term.content).toEqual(data.content);
    expect(term.locale).toEqual(data.locale);
    expect(term.comments).toEqual(data.comment);

    data = {content: '', locale: '', comment: 'comment'};
    expect(GlossaryHelper.generateGlossaryTermDTO(data)).toBeNull();
  });

  it('test generate glossary dto', function() {
    var srcTerm = {content: 'src_content', locale: 'en-US', comment: 'comment', reference: 'ref'},
      transTerm = {content: 'trans_content', locale: 'en-US', comment: 'comment'};
    var data = {resId: 'resId', pos: 'noun', description: 'description', srcTerm: srcTerm, transTerm: transTerm};

    var glossary = GlossaryHelper.generateGlossaryDTO(data);
    expect(_.size(glossary.glossaryEntries)).toEqual(1);

    var entry = glossary.glossaryEntries[0];
    expect(entry.resId).toEqual(data.resId);
    expect(entry.pos).toEqual(data.pos);
    expect(entry.description).toEqual(data.description);
    expect(_.size(entry.glossaryTerms)).toEqual(2);
  });

  it('test generate empty term', function() {
    var localeId = 'de';
    var term = GlossaryHelper.generateTerm(localeId);
    expect(term.locale).toEqual(localeId);
  });

  it('test generate empty src term', function() {
    var localeId = 'de';
    var term = GlossaryHelper.generateSrcTerm(localeId);
    expect(term.locale).toEqual(localeId);
  });

  it('test get entry status', function () {
    var entry1, entry2;
    GlossaryHelper.getEntryStatus(entry1, entry2);
  })
});