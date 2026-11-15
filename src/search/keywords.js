// Words students type that are not in a title: synonyms, concept names, authors' wording, in English and
// French. The search finds an item by its title, its keywords or its description (both languages at
// once: a student on the French site may type an English word, and the other way round).
//
// Keys: a topic's slug ("mean-median"), or "<topic>/<activity>" for a game or an extra. An activity also
// inherits its topic's words (with a lower weight) and generic words for its kind (KIND_KW).
// Adding a game? Add its line here: `tools/search-check.mjs` (run by `npm run check`) fails if a game or a
// topic cannot be found by its own name in both languages.

export const KW = {
  // ---------- Topic 01: mean, median, mode ----------
  'mean-median': {
    en: 'average centre center central tendency location typical skew outlier extreme value robust arithmetic',
    fr: 'moyenne médiane mode centre tendance centrale valeur typique asymétrie valeur extrême aberrante robuste arithmétique',
  },
  'mean-median/muller-lyer': {
    en: 'illusion lines arrows perception visual outlier one far try mean follows median stays',
    fr: 'illusion lignes flèches perception visuelle valeur extrême essai éloigné moyenne suit médiane',
  },
  'mean-median/digit-span': {
    en: 'memory span working memory seven 7 plus or minus two Miller digits numbers recall',
    fr: 'mémoire empan mémoire de travail sept 7 plus ou moins deux Miller chiffres nombres rappel',
  },
  'mean-median/blue-seven': {
    en: 'random number seven 7 favourite colour blue category categorical nominal mode bias choose pick',
    fr: 'nombre au hasard sept 7 couleur préférée bleu catégorie catégoriel nominal mode biais choisir',
  },
  'mean-median/playground': {
    en: 'sandbox dots drag add remove challenges salaries reaction times real examples survey',
    fr: 'bac à sable points glisser ajouter retirer défis salaires temps de réaction exemples réels sondage',
  },
  'mean-median/calculate': {
    en: 'formula sum divide sort tally step by step calculation how to compute mean median mode',
    fr: 'formule somme division tri décompte calcul pas à pas comment calculer moyenne médiane mode',
  },
  'mean-median/spot-the-centre': {
    en: 'practice train eye quick rounds estimate guess skewed centre',
    fr: 'entraînement manches rapides estimer deviner asymétrique centre',
  },
  'mean-median/quiz': {
    en: 'quiz mean median mode skewed outlier salary questions explanation',
    fr: 'quiz moyenne médiane mode asymétrique valeur extrême salaire questions explication',
  },
  // ---------- Topic 02: variance and standard deviation ----------
  'variance-sd': {
    en: 'spread dispersion variability SD standard deviation variance deviation squared errors sample population n-1 Bessel precision',
    fr: 'dispersion écart-type écart type variance variabilité déviation erreurs au carré échantillon population n-1 Bessel précision',
  },
  'variance-sd/memory': {
    en: 'memory precision error repeated tries squared errors remember recall',
    fr: 'mémoire précision erreur essais répétés erreurs au carré se souvenir rappel',
  },
  'variance-sd/find-the-middle': {
    en: 'estimate mean by eye midpoint average position deviation balance',
    fr: 'estimer le milieu moyenne à l’œil point central position écart équilibre',
  },
  'variance-sd/how-many-dots': {
    en: 'numerosity estimation counting dots subitizing sample size bias n-1 Bessel',
    fr: 'estimation du nombre dénombrement points numérosité taille de l’échantillon biais n-1 Bessel',
  },
  'variance-sd/playground': {
    en: 'sandbox dots spread standard deviation variance drag add',
    fr: 'bac à sable points dispersion écart-type variance glisser ajouter',
  },
  'variance-sd/calculate': {
    en: 'formula squares sum divide root calculation step by step how to compute standard deviation',
    fr: 'formule carrés somme division racine calcul pas à pas comment calculer écart-type',
  },
  'variance-sd/spot-the-spread': {
    en: 'practice train eye quick rounds estimate spread wide narrow',
    fr: 'entraînement manches rapides estimer dispersion large étroit',
  },
  'variance-sd/quiz': {
    en: 'quiz variance standard deviation spread n-1 questions explanation',
    fr: 'quiz variance écart-type dispersion n-1 questions explication',
  },
  // ---------- Topic 03: the normal distribution ----------
  'normal-distribution': {
    en: 'bell curve gaussian z-score z score standard normal 68 95 99.7 rule empirical rule central limit theorem CLT percentile area probability',
    fr: 'courbe en cloche gaussienne loi normale z-score score z cote z règle 68 95 99,7 théorème central limite centile aire probabilité',
  },
  'normal-distribution/inner-clock': {
    en: 'time estimation two seconds timing interval internal clock hold button bell',
    fr: 'estimation du temps deux secondes chronométrage intervalle horloge interne maintenir bouton cloche',
  },
  'normal-distribution/neuron-sum': {
    en: 'neuron adds up inputs central limit theorem sum of many small effects bell curve membrane',
    fr: 'neurone additionne entrées théorème central limite somme de nombreux petits effets courbe en cloche membrane',
  },
  'normal-distribution/tap-the-beat': {
    en: 'rhythm beat tapping metronome synchronisation synchronization asynchrony timing sensorimotor',
    fr: 'rythme battement tapoter métronome synchronisation asynchronie chronométrage sensorimoteur',
  },
  'normal-distribution/playground': {
    en: 'sandbox bell curve mean standard deviation area slider shade',
    fr: 'bac à sable courbe en cloche moyenne écart-type aire curseur zone',
  },
  'normal-distribution/calculate': {
    en: 'z score formula percentile probability area calculation step by step',
    fr: 'score z formule centile probabilité aire calcul pas à pas',
  },
  'normal-distribution/read-the-bell': {
    en: 'practice train eye read values bell curve percent within standard deviations',
    fr: 'entraînement lire valeurs courbe en cloche pourcentage écarts-types',
  },
  'normal-distribution/quiz': {
    en: 'quiz normal distribution z-score 68 95 99.7 percentile questions explanation',
    fr: 'quiz loi normale score z 68 95 99,7 centile questions explication',
  },
  // ---------- Topic 04: right-skewed distributions ----------
  'right-skewed': {
    en: 'skew skewed positive skew long tail lognormal log-normal reaction times RT floor ceiling asymmetric',
    fr: 'asymétrie asymétrique à droite traîne longue log-normale temps de réaction plancher plafond',
  },
  'right-skewed/reaction-time': {
    en: 'response time RT reaction speed reflex tap median mean tail ex-Gaussian',
    fr: 'temps de réponse réaction vitesse réflexe toucher médiane moyenne traîne',
  },

  // ---------- Topic 05: the exponential distribution ----------
  exponential: {
    en: 'waiting time memoryless Poisson spikes inter-spike interval rate decay random events',
    fr: 'temps d’attente sans mémoire Poisson décharges intervalle entre décharges taux décroissance événements aléatoires',
  },
  'exponential/neuron': {
    en: 'neuron action potential spike firing random Poisson waiting listen tap',
    fr: 'neurone potentiel d’action décharge aléatoire Poisson attente écouter toucher',
  },

  // ---------- Topic 06: the binomial distribution ----------
  binomial: {
    en: 'binomial test coin flip probability successes trials p-value chance luck significance hypothesis test',
    fr: 'loi binomiale test pile ou face probabilité succès essais valeur p hasard significativité test d’hypothèse',
  },
  'binomial/ebbinghaus': {
    en: 'illusion circles Titchener size contrast count successes luck 20 trials fooled',
    fr: 'illusion cercles Titchener taille contraste comptage succès hasard 20 essais trompé',
  },
}

// Words for every extra of a kind (a playground, a live calculation, a quick-practice game, a quiz).
export const KIND_KW = {
  discover: {
    en: 'game experiment discover study real experiment',
    fr: 'jeu expérience découvrir étude expérience réelle',
  },
  play: {
    en: 'explore playground sandbox free play interactive simulation',
    fr: 'explorer bac à sable jeu libre interactif simulation',
  },
  train: {
    en: 'train your eye practice quick rounds feedback drill',
    fr: 'entraînez votre œil entraînement manches rapides retour immédiat exercice',
  },
  quiz: {
    en: 'quiz test questions multiple choice explanation revision exam check yourself',
    fr: 'quiz test questions choix multiple explication révision examen vous tester',
  },
}

// Pages and the five About tabs (their titles come from the About text, see engine.js).
export const PAGES = [
  {
    id: 'home',
    to: '/',
    title: { en: 'Home', fr: 'Accueil' },
    sub: {
      en: 'Learn statistics with data you make yourself. Hold the button for 2 seconds and watch the curve.',
      fr: 'Apprenez les statistiques avec vos propres données. Maintenez le bouton 2 secondes et regardez la courbe.',
    },
    kw: {
      en: 'start welcome landing hero clock hold button two seconds learn statistics psychology neuroscience',
      fr: 'début bienvenue accueil horloge maintenir bouton deux secondes apprendre statistiques psychologie neurosciences',
    },
  },
  {
    id: 'topics',
    to: '/topics',
    title: { en: 'All topics', fr: 'Tous les thèmes' },
    sub: { en: 'The course plan: six topics, each with its games.', fr: 'Le plan du cours : six thèmes, chacun avec ses jeux.' },
    kw: { en: 'topics course plan list parts index syllabus', fr: 'thèmes cours plan liste parties sommaire programme' },
  },
  {
    id: 'references',
    to: '/references',
    title: { en: 'References', fr: 'Références' },
    sub: { en: 'Every study and book cited on the site, in APA 7.', fr: 'Chaque étude et chaque livre cités sur le site, en APA 7.' },
    kw: {
      en: 'bibliography citations sources studies papers literature DOI APA books articles',
      fr: 'bibliographie citations sources études articles littérature DOI APA livres',
    },
  },
  {
    id: 'privacy',
    to: '/privacy',
    title: { en: 'Privacy and legal notice', fr: 'Vie privée et mentions légales' },
    sub: {
      en: 'No account, no cookie, no tracking. What is saved on your device, who hosts the site, who to contact.',
      fr: 'Pas de compte, pas de cookie, pas de pistage. Ce qui est enregistré sur votre appareil, l’hébergeur, le contact.',
    },
    kw: {
      en: 'privacy policy legal notice cookies GDPR RGPD data personal data tracking analytics consent terms licence host GitHub contact fonts',
      fr: 'vie privée confidentialité politique mentions légales cookies RGPD données personnelles pistage statistiques consentement conditions licence hébergeur GitHub contact polices',
    },
  },
  {
    id: 'licences',
    to: '/licences',
    title: { en: 'Licences', fr: 'Licences' },
    sub: {
      en: 'The fonts, styles and code of other authors that StatsCool uses, with their copyright and licence.',
      fr: 'Les polices, styles et code d’autres auteurs utilisés par StatsCool, avec leur copyright et leur licence.',
    },
    kw: {
      en: 'licences licenses credits copyright open source third party notices attribution fonts Inter IBM Plex Mono Fraunces KaTeX Carbon Bootstrap UIkit HiQ React D3 Motion MIT Apache ISC OFL',
      fr: 'licences crédits droits d’auteur copyright open source tiers mentions attribution polices Inter IBM Plex Mono Fraunces KaTeX Carbon Bootstrap UIkit HiQ React D3 Motion MIT Apache ISC OFL',
    },
  },
]

export const ABOUT_KW = {
  idea: {
    en: 'why StatsCool idea four steps discover explore train check learning path free open source',
    fr: 'pourquoi StatsCool idée quatre étapes découvrir explorer entraîner vérifier parcours gratuit open source',
  },
  teaching: {
    en: 'learning science research evidence feedback retrieval practice spacing interleaving pedagogy how it teaches mastery',
    fr: 'science de l’apprentissage recherche preuves retour rétroaction pratique espacée pédagogie comment on apprend maîtrise',
  },
  experiments: {
    en: 'experiments studies behind the games findings papers original research',
    fr: 'expériences études derrière les jeux résultats articles recherche originale',
  },
  use: {
    en: 'cite citation APA licence license MIT CC BY privacy open source GitHub AI disclosure cookies data no account how it is built',
    fr: 'citer citation APA licence MIT CC BY vie privée confidentialité open source GitHub IA cookies données sans compte comment le site est fait',
  },
  author: {
    en: 'author contact inspiration LinkedIn ResearchGate GitHub who made this',
    fr: 'auteur contact inspiration LinkedIn ResearchGate GitHub qui a fait ce site',
  },
}
