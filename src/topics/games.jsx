import { preloadable } from '../components/Preloadable.jsx'

// Each game, extra and recap sheet is its own file, downloaded when first needed (Step 114, see Preloadable.jsx).
const ClockGame = preloadable(() => import('./normal-distribution/ClockGame.jsx'))
const SumNeuron = preloadable(() => import('./normal-distribution/SumNeuron.jsx'))
const TapBeat = preloadable(() => import('./normal-distribution/TapBeat.jsx'))
const NormalPlay = preloadable(() => import('./normal-distribution/NormalPlay.jsx'))
const NormalCalc = preloadable(() => import('./normal-distribution/NormalCalc.jsx'))
const MeanMedian = preloadable(() => import('./mean-median/MeanMedian.jsx'))
const DigitSpan = preloadable(() => import('./mean-median/DigitSpan.jsx'))
const BlueSeven = preloadable(() => import('./mean-median/BlueSeven.jsx'))
const Playground = preloadable(() => import('./mean-median/Playground.jsx'))
const MeanQuiz = preloadable(() => import('./mean-median/MeanQuiz.jsx'))
const SpotCentre = preloadable(() => import('./mean-median/SpotCentre.jsx'))
const CalcLab = preloadable(() => import('./mean-median/CalcLab.jsx'))
const MeanRecap = preloadable(() => import('./mean-median/MeanRecap.jsx'))
const ReactionTime = preloadable(() => import('./right-skewed/ReactionTime.jsx'))
const Neuron = preloadable(() => import('./exponential/Neuron.jsx'))
const Ebbinghaus = preloadable(() => import('./binomial/Ebbinghaus.jsx'))
const MemoryGame = preloadable(() => import('./variance-sd/MemoryGame.jsx'))
const Bisection = preloadable(() => import('./variance-sd/Bisection.jsx'))
const Dots = preloadable(() => import('./variance-sd/Dots.jsx'))
const SpreadPlay = preloadable(() => import('./variance-sd/SpreadPlay.jsx'))
const SdCalc = preloadable(() => import('./variance-sd/SdCalc.jsx'))
const SdQuiz = preloadable(() => import('./variance-sd/SdQuiz.jsx'))
const SpotSpread = preloadable(() => import('./variance-sd/SpotSpread.jsx'))
const ReadBell = preloadable(() => import('./normal-distribution/ReadBell.jsx'))
const NormalQuiz = preloadable(() => import('./normal-distribution/NormalQuiz.jsx'))

// The component of each game, by "<topic slug>/<game slug>" (the texts are in topics.js).
export const GAMES = {
  'mean-median/muller-lyer': MeanMedian,
  'mean-median/digit-span': DigitSpan,
  'mean-median/blue-seven': BlueSeven,
  'mean-median/playground': Playground,
  'mean-median/calculate': CalcLab,
  'mean-median/spot-the-centre': SpotCentre,
  'mean-median/quiz': MeanQuiz,
  'variance-sd/memory': MemoryGame,
  'variance-sd/find-the-middle': Bisection,
  'variance-sd/how-many-dots': Dots,
  'variance-sd/playground': SpreadPlay,
  'variance-sd/calculate': SdCalc,
  'variance-sd/spot-the-spread': SpotSpread,
  'variance-sd/quiz': SdQuiz,
  'normal-distribution/inner-clock': ClockGame,
  'normal-distribution/neuron-sum': SumNeuron,
  'normal-distribution/tap-the-beat': TapBeat,
  'normal-distribution/playground': NormalPlay,
  'normal-distribution/read-the-bell': ReadBell,
  'normal-distribution/quiz': NormalQuiz,
  'normal-distribution/calculate': NormalCalc,
  'right-skewed/reaction-time': ReactionTime,
  'exponential/neuron': Neuron,
  'binomial/ebbinghaus': Ebbinghaus,
}

// A recap sheet per topic, shown on the topic page after the games (optional).
export const RECAPS = {
  'mean-median': MeanRecap,
}
