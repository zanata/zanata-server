jest.dontMock('../GlossaryStore')
  .dontMock('moment')
  .dontMock('moment-range');
jest.mock('../../utils/DateHelper');