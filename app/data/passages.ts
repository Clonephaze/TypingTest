export interface Passage {
  id: string
  text: string
  language?: string
}

export interface PassageData {
  easy: Passage[]
  medium: Passage[]
  hard: Passage[]
  quotes: Passage[]
  code: Passage[]
}

export const passages: PassageData = {
  easy: [
    { id: 'easy-1', text: 'The sun rose over the quiet town. Birds sang in the trees as people woke up and started their day. It was going to be a warm and sunny morning.' },
    { id: 'easy-2', text: 'She walked to the store to buy some bread and milk. The shop was busy but she found what she needed quickly. On her way home, she saw a friend and waved.' },
    { id: 'easy-3', text: 'The dog ran across the park chasing a ball. He was fast and loved to play. After a while, he got tired and lay down in the cool shade of a big oak tree.' },
    { id: 'easy-4', text: 'I like to read books before I go to sleep. It helps me relax after a long day. My favorite stories are about adventure and travel to far away places.' },
    { id: 'easy-5', text: 'The kitchen smelled of fresh coffee and toast. Mom was making breakfast while dad read the news. It was a normal morning in their small but cozy home.' },
    { id: 'easy-6', text: 'We went to the beach last summer. The water was blue and the sand was warm. We built a big sand castle and looked for shells along the shore.' },
    { id: 'easy-7', text: 'The cat sat on the window sill watching the rain. Drops fell down the glass one by one. She seemed happy to be inside where it was dry and warm.' },
    { id: 'easy-8', text: 'My best friend lives next door to me. We play games together after school. Sometimes we ride our bikes around the block or sit and talk for hours.' },
    { id: 'easy-9', text: 'Spring is my favorite time of year. Flowers start to bloom and the days get longer. I love to see the trees turn green again after the cold winter months.' },
    { id: 'easy-10', text: 'The music played softly in the room. She closed her eyes and let the sounds wash over her. It was a simple song but it made her feel at peace.' },
  ],
  medium: [
    { id: 'medium-1', text: 'Learning a new skill takes patience and consistent practice. Whether you\'re studying a language, picking up an instrument, or mastering a sport, the key is to show up every day. Small improvements compound over time, and before you know it, you\'ll have made remarkable progress.' },
    { id: 'medium-2', text: 'The old lighthouse had stood on the cliff for over a century, guiding sailors safely through treacherous waters. Its beam cut through the fog each night, a reassuring presence for those navigating the rocky coastline. Many storms had tested its structure, but it remained steadfast.' },
    { id: 'medium-3', text: 'Coffee culture has evolved dramatically in recent decades. What was once a simple morning ritual has become an art form, with baristas crafting intricate latte designs and roasters sourcing beans from remote mountain villages. The humble cup of coffee now tells a global story.' },
    { id: 'medium-4', text: 'Urban gardens are transforming city landscapes around the world. Residents are converting rooftops, balconies, and abandoned lots into thriving green spaces. These initiatives not only provide fresh produce but also create communities, reduce stress, and help combat the urban heat island effect.' },
    { id: 'medium-5', text: 'The documentary explored how technology shapes our daily habits. From the moment we wake to an alarm on our phones to the podcasts we fall asleep to, digital tools have woven themselves into the fabric of modern life. The question is: are we in control?' },
    { id: 'medium-6', text: 'Traveling by train offers a unique perspective on the countryside. Unlike flying, which reduces landscapes to abstract patterns, rail journeys let you witness the gradual transitions between regions. You see farms give way to forests, and small towns emerge from rolling hills.' },
    { id: 'medium-7', text: 'The chef believed that great cooking starts with quality ingredients. She visited local farmers each week, selecting vegetables at their peak ripeness. Her menu changed with the seasons, reflecting what the land offered. Diners appreciated the freshness they could taste in every bite.' },
    { id: 'medium-8', text: 'Libraries have reinvented themselves for the digital age. Beyond lending books, they now offer coworking spaces, 3D printers, recording studios, and coding workshops. These community hubs have become places where people of all ages come to learn, create, and connect with others.' },
    { id: 'medium-9', text: 'The architect designed buildings that worked with nature rather than against it. Large windows captured natural light, reducing the need for electricity. Green roofs absorbed rainwater and provided insulation. Her philosophy was simple: sustainable design should be beautiful, functional, and accessible to everyone.' },
    { id: 'medium-10', text: 'Night markets come alive after sunset in cities across Asia. Vendors set up stalls selling everything from grilled skewers to handmade crafts. The air fills with enticing aromas and the buzz of conversation. Locals and tourists alike wander through, sampling street food and hunting for bargains.' },
  ],
  hard: [
    { id: 'hard-1', text: 'The philosopher\'s argument hinged on a seemingly paradoxical assertion: that absolute freedom, pursued without constraint, inevitably undermines itself. "Consider," she wrote, "how the libertarian ideal—when taken to its logical extreme—produces conditions in which the powerful dominate the weak, thereby eliminating freedom for the majority." Her critics dismissed this as sophistry; her supporters hailed it as profound.' },
    { id: 'hard-2', text: 'Quantum entanglement—Einstein\'s "spooky action at a distance"—continues to perplex physicists and philosophers alike. When two particles become entangled, measuring one instantaneously affects the other, regardless of the distance separating them. This phenomenon doesn\'t violate relativity (no information travels faster than light), yet it challenges our intuitions about locality, causality, and the nature of reality itself.' },
    { id: 'hard-3', text: 'The Renaissance polymath\'s correspondence reveals a mind of extraordinary breadth: in a single week\'s letters, he discussed astronomical observations, critiqued a colleague\'s architectural drawings, proposed improvements to the city\'s sewage system, and composed a sonnet for a patron\'s daughter. "Specialization," he remarked wryly, "is for insects." His contemporaries found him exhausting; posterity finds him inspirational.' },
    { id: 'hard-4', text: 'Algorithmic trading has fundamentally restructured financial markets. High-frequency systems execute thousands of transactions per second, exploiting minute price discrepancies across exchanges. Critics argue this creates systemic fragility—the 2010 "Flash Crash" saw the Dow Jones plummet 1,000 points in minutes before recovering. Proponents counter that algorithms provide liquidity and reduce spreads, ultimately benefiting retail investors.' },
    { id: 'hard-5', text: 'The biographer faced an ethical dilemma: her subject\'s private journals—recently discovered in an attic—contained revelations that would overturn his carefully cultivated public image. Should she publish them? "Biography," she mused, "exists in tension between truth-telling and respect for the dead." After months of deliberation, she chose disclosure, reasoning that sanitized history serves no one.' },
    { id: 'hard-6', text: 'Microplastics have infiltrated virtually every ecosystem on Earth, from the Mariana Trench to Arctic ice cores. These polymer fragments—smaller than 5mm in diameter—originate from degrading consumer products, synthetic textiles, and industrial processes. Researchers have detected them in human blood, placental tissue, and breast milk; their long-term health implications remain disturbingly unclear.' },
    { id: 'hard-7', text: 'The conductor\'s interpretation of Mahler\'s Ninth Symphony emphasized its prophetic qualities—the premonition of catastrophe, the aching nostalgia for a world about to vanish. "Mahler composed this knowing he was dying," she explained in the program notes, "but he also intuited, somehow, that European civilization itself stood at the precipice." The orchestra\'s performance—hushed, trembling, transcendent—left the audience in stunned silence.' },
    { id: 'hard-8', text: 'Constitutional scholars continue debating the "counter-majoritarian difficulty": how can judicial review—whereby unelected judges overturn legislation passed by democratic representatives—be reconciled with popular sovereignty? Some argue courts protect minority rights against tyrannical majorities; others contend this reasoning masks ideological preferences in neutral-sounding jurisprudence.' },
    { id: 'hard-9', text: 'The novelist\'s prose style—elliptical, fragmented, punctuated by abrupt temporal shifts—reflected her thematic preoccupations: memory\'s unreliability, identity\'s fluidity, the impossibility of objective narration. "Every story," she declared in an interview, "is simultaneously true and false; it reveals by concealing, illuminates by casting shadows." Critics accused her of obscurantism; she responded that clarity itself can be a form of deception.' },
    { id: 'hard-10', text: 'The archaeological expedition unearthed artifacts that complicated prevailing theories about Bronze Age trade networks. Obsidian from Anatolia, lapis lazuli from Afghanistan, and amber from the Baltic—all discovered in a single Mycenaean tomb—suggested commercial connections far more extensive than previously hypothesized. "We\'ve underestimated ancient peoples\' navigational capabilities," the lead researcher observed. "Globalization isn\'t as modern as we assume."' },
  ],
  quotes: [
    { id: 'quote-1', text: 'The only way to do great work is to love what you do. If you haven\'t found it yet, keep looking. Don\'t settle. As with all matters of the heart, you\'ll know when you find it. — Steve Jobs' },
    { id: 'quote-2', text: 'Whether you think you can, or you think you can\'t, you\'re right. The mind is everything. What you think you become. Success is not an accident; it is the result of belief backed by persistent action. — Henry Ford' },
    { id: 'quote-3', text: 'Life is what happens when you\'re busy making other plans. In the end, it\'s not the years in your life that count. It\'s the life in your years. Cherish every moment you have. — John Lennon' },
    { id: 'quote-4', text: 'The greatest glory in living lies not in never falling, but in rising every time we fall. The real measure of our strength is how we respond when things go wrong. — Nelson Mandela' },
    { id: 'quote-5', text: 'In three words I can sum up everything I\'ve learned about life: it goes on. No matter what happens, no matter how hard the crash, people get back up. That is the one thing I know for certain. — Robert Frost' },
    { id: 'quote-6', text: 'Success is not final, failure is not fatal: it is the courage to continue that counts. Never give up, for that is just the place and time that the tide will turn. — Winston Churchill' },
    { id: 'quote-7', text: 'Your time is limited, so don\'t waste it living someone else\'s life. Don\'t be trapped by dogma, which is living with the results of other people\'s thinking. Have the courage to follow your heart. — Steve Jobs' },
    { id: 'quote-8', text: 'It does not matter how slowly you go as long as you do not stop. Everything has beauty, but not everyone sees it. The man who moves a mountain begins by carrying away small stones. — Confucius' },
    { id: 'quote-9', text: 'Spread love everywhere you go. Let no one ever come to you without leaving happier. If you judge people, you have no time to love them. Be the living expression of God\'s kindness. — Mother Teresa' },
    { id: 'quote-10', text: 'It is during our darkest moments that we must focus to see the light. Happiness is not something readymade. It comes from your own actions. Examine the nature of mind and you will find there is no darkness. — Aristotle' },
  ],
  code: [
    {
      id: 'code-1',
      language: 'Python',
      text: `def binary_search(arr, target):
  lo, hi = 0, len(arr) - 1
  while lo <= hi:
    mid = (lo + hi) // 2
    if arr[mid] == target:
      return mid
    elif arr[mid] < target:
      lo = mid + 1
    else:
      hi = mid - 1
  return -1`,
    },
    {
      id: 'code-2',
      language: 'TypeScript',
      text: `async function retry<T>(
  fn: () => Promise<T>,
  attempts = 3
): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === attempts - 1) throw err
    }
  }
  throw new Error('unreachable')
}`,
    },
    {
      id: 'code-3',
      language: 'Go',
      text: `func fibonacci(n int) int {
  if n <= 1 {
    return n
  }
  a, b := 0, 1
  for i := 2; i <= n; i++ {
    a, b = b, a+b
  }
  return b
}

func main() {
  for i := 0; i <= 10; i++ {
    fmt.Println(fibonacci(i))
  }
}`,
    },
    {
      id: 'code-4',
      language: 'Rust',
      text: `fn is_prime(n: u64) -> bool {
  if n < 2 { return false; }
  if n == 2 { return true; }
  if n % 2 == 0 { return false; }
  let mut i = 3u64;
  while i * i <= n {
    if n % i == 0 { return false; }
    i += 2;
  }
  true
}`,
    },
    {
      id: 'code-5',
      language: 'CSS',
      text: `.card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 0.5rem;
  background: var(--surface);
  box-shadow: 0 2px 8px hsl(0 0% 0% / 0.15);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}`,
    },
    {
      id: 'code-6',
      language: 'JavaScript',
      text: `function debounce(fn, delay) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

const search = debounce((query) => {
  console.log('searching:', query)
}, 300)`,
    },
    {
      id: 'code-7',
      language: 'SQL',
      text: `SELECT
  u.name,
  COUNT(o.id) AS orders,
  SUM(o.total) AS revenue
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.active = true
  AND o.created_at >= '2024-01-01'
GROUP BY u.id
HAVING COUNT(o.id) > 2
ORDER BY revenue DESC
LIMIT 20;`,
    },
    {
      id: 'code-8',
      language: 'HTML',
      text: `<article class="card">
  <header class="card-header">
    <h2 class="card-title">Post Title</h2>
    <time datetime="2025-01-01">January 1, 2025</time>
  </header>
  <p class="card-body">
    A short description of the article content.
  </p>
  <footer class="card-footer">
    <a href="/article/1">Read more</a>
  </footer>
</article>`,
    },
    {
      id: 'code-9',
      language: 'Bash',
      text: `#!/bin/bash
BACKUP="$HOME/backups/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP"

for file in ~/Documents/*.txt; do
  cp "$file" "$BACKUP/"
  echo "Backed up: $file"
done

echo "Done. Files saved to $BACKUP"`,
    },
    {
      id: 'code-10',
      language: 'Python',
      text: `class Stack:
  def __init__(self):
    self._items = []

  def push(self, item):
    self._items.append(item)

  def pop(self):
    if not self._items:
      raise IndexError("pop from empty stack")
    return self._items.pop()

  def peek(self):
    return self._items[-1]`,
    },
  ],
}
