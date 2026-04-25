import { analyzeRouter } from './analyze/analyze-controller';
import { kanjiRouter } from './kanji/kanji-controller';
import { letterRouter } from './letter/letter-controller';
import { addTodo, listTodos } from './todos';

export default {
  listTodos,
  addTodo,
  letter: letterRouter,
  analyze: analyzeRouter,
  kanji: kanjiRouter,
};
