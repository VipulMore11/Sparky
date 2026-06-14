import type { AgeContent, AgeGroup } from "./types"

// ---------------------------------------------------------------------------
// AGES 3-5 — Explorer Island: letters, words, simple instructions, light STEM
// ---------------------------------------------------------------------------
const age3to5: AgeContent = {
  age: "3-5",
  label: "Ages 3–5",
  blurb: "Letters, words & first writing",
  focus: ["Letter recognition", "Word recognition", "Following instructions", "Early writing", "Vocabulary"],
  stem: ["Counting", "Shapes", "Colors", "Animals", "Weather", "Patterns"],
  worlds: [
    {
      id: "w35-1",
      title: "Explorer Island",
      tagline: "Letters, sounds & little words",
      lessons: [
        {
          id: "l35-1",
          title: "Meet the Letters",
          subtitle: "Find letters and sounds",
          xp: 10,
          steps: [
            { kind: "intro", title: "Hello, Explorer!", body: "Today we will find letters and read tiny words. Tap the right answer to win stars!" },
            {
              kind: "read-choice",
              modality: "reading",
              prompt: "Which one is the letter that starts the word SUN?",
              options: ["S", "M", "T", "B"],
              answer: 0,
            },
            {
              kind: "read-choice",
              modality: "reading",
              prompt: "Read the word. Which picture word is it?  C A T",
              options: ["cat", "dog", "fish", "bird"],
              answer: 0,
            },
            {
              kind: "write-fill",
              modality: "writing",
              prompt: "Finish the word. A baby dog is a 'pup'.",
              before: "pu",
              after: "",
              answers: ["p", "pp"],
            },
            {
              kind: "match",
              modality: "reading",
              prompt: "Match each animal word to its sound.",
              pairs: [
                { left: "Dog", right: "Woof" },
                { left: "Cat", right: "Meow" },
                { left: "Cow", right: "Moo" },
              ],
            },
          ],
        },
        {
          id: "l35-2",
          title: "Count & Color",
          subtitle: "Numbers, shapes and colors",
          xp: 10,
          steps: [
            { kind: "intro", title: "Counting Fun", body: "Let's count things and name colors. Reading numbers helps us with math!" },
            {
              kind: "read-choice",
              modality: "reading",
              prompt: "Read it: 'Three red apples.' How many apples?",
              options: ["1", "2", "3", "5"],
              answer: 2,
            },
            {
              kind: "read-choice",
              modality: "reading",
              prompt: "Which word names a SHAPE?",
              options: ["circle", "happy", "jump", "loud"],
              answer: 0,
            },
            {
              kind: "write-fill",
              modality: "writing",
              prompt: "Finish the color word. The sky is 'blue'.",
              before: "bl",
              after: "e",
              answers: ["u", "ue"],
            },
          ],
        },
        {
          id: "l35-3",
          title: "Follow Along",
          subtitle: "Read and follow instructions",
          xp: 15,
          steps: [
            { kind: "intro", title: "Do What It Says", body: "Reading instructions tells us what to do. Let's practice!" },
            {
              kind: "read-order",
              modality: "reading",
              prompt: "Put the steps in order to wash your hands.",
              items: ["Turn on water", "Add soap", "Rub hands", "Dry hands"],
            },
            {
              kind: "write-short",
              modality: "writing",
              prompt: "Write one thing you like about animals.",
              hintText: "Try a word like: soft, cute, big, or run.",
              keywords: ["soft", "cute", "big", "run", "fur", "play", "small", "fast", "nice"],
              minKeywords: 1,
              sample: "I like that dogs are soft and run fast.",
            },
          ],
        },
      ],
    },
  ],
}

// ---------------------------------------------------------------------------
// AGES 6-8 — Word Valley: short passages, instructions, simple responses
// ---------------------------------------------------------------------------
const age6to8: AgeContent = {
  age: "6-8",
  label: "Ages 6–8",
  blurb: "Short passages & simple writing",
  focus: ["Reading short passages", "Understanding instructions", "Writing responses", "Labeling", "Comprehension"],
  stem: ["Addition", "Subtraction", "Fractions", "Plants", "Magnets", "Classification"],
  worlds: [
    {
      id: "w68-1",
      title: "Word Valley",
      tagline: "Read a little, write a little",
      lessons: [
        {
          id: "l68-1",
          title: "The Tiny Seed",
          subtitle: "Read about how plants grow",
          xp: 15,
          steps: [
            { kind: "intro", title: "Growing Plants", body: "Read the passage, then answer questions and write your own idea." },
            {
              kind: "read-choice",
              modality: "reading",
              passage:
                "A seed needs three things to grow: water, sunlight, and soil. First the seed sleeps in the soil. Then water wakes it up. Soon a small green sprout pushes toward the sun.",
              prompt: "What wakes the seed up?",
              options: ["Wind", "Water", "Music", "Snow"],
              answer: 1,
            },
            {
              kind: "read-order",
              modality: "reading",
              passage: "Think about the order from the passage.",
              prompt: "Put the plant's growth in order.",
              items: ["Seed sleeps in soil", "Water wakes the seed", "A sprout grows", "It reaches the sun"],
            },
            {
              kind: "write-short",
              modality: "writing",
              prompt: "In your own words, name TWO things a plant needs to grow.",
              hintText: "The passage mentioned water, sunlight, and soil.",
              keywords: ["water", "sun", "sunlight", "soil", "light", "dirt"],
              minKeywords: 2,
              sample: "A plant needs water and sunlight to grow.",
            },
          ],
        },
        {
          id: "l68-2",
          title: "Math Story Time",
          subtitle: "Read a math word problem",
          xp: 15,
          steps: [
            { kind: "intro", title: "Story Math", body: "Reading carefully helps us solve math stories." },
            {
              kind: "read-choice",
              modality: "reading",
              passage: "Maya has 6 apples. She gives 2 apples to her friend Sam. Then she finds 3 more apples in the kitchen.",
              prompt: "How many apples does Maya have now?",
              options: ["5", "7", "8", "11"],
              answer: 1,
            },
            {
              kind: "write-fill",
              modality: "writing",
              prompt: "Finish the sentence: 6 minus 2 equals ____.",
              before: "",
              after: "",
              answers: ["4", "four"],
            },
            {
              kind: "write-short",
              modality: "writing",
              prompt: "Explain how you found Maya's answer.",
              hintText: "Tell what you subtracted and what you added.",
              keywords: ["subtract", "minus", "take", "add", "plus", "gave", "found", "more", "6", "2", "3"],
              minKeywords: 2,
              sample: "She gave away 2 so 6 minus 2 is 4, then added 3 more to get 7.",
            },
          ],
        },
        {
          id: "l68-3",
          title: "Magnet Magic",
          subtitle: "Label and classify",
          xp: 20,
          steps: [
            { kind: "intro", title: "Pull & Push", body: "Magnets pull some things and ignore others. Let's read and sort." },
            {
              kind: "read-choice",
              modality: "reading",
              passage: "Magnets attract objects made of iron and steel. They do not attract wood, plastic, or paper.",
              prompt: "Which object would a magnet attract?",
              options: ["A wooden spoon", "A steel nail", "A paper cup", "A plastic toy"],
              answer: 1,
            },
            {
              kind: "match",
              modality: "reading",
              prompt: "Match each object to whether a magnet pulls it.",
              pairs: [
                { left: "Steel nail", right: "Pulls" },
                { left: "Plastic toy", right: "No pull" },
                { left: "Iron key", right: "Pulls" },
                { left: "Paper", right: "No pull" },
              ],
            },
          ],
        },
      ],
    },
  ],
}

// ---------------------------------------------------------------------------
// AGES 9-12 — Logic Mountain: analytical reading, explanation writing
// ---------------------------------------------------------------------------
const age9to12: AgeContent = {
  age: "9-12",
  label: "Ages 9–12",
  blurb: "Analytical reading & explaining",
  focus: ["Analytical reading", "Information extraction", "Explanation writing", "Multi-step reasoning", "Data interpretation"],
  stem: ["Ratios", "Graphs", "Experiments", "Engineering", "Coding logic", "Scientific thinking"],
  worlds: [
    {
      id: "w912-1",
      title: "Logic Mountain",
      tagline: "Read closely, reason clearly",
      lessons: [
        {
          id: "l912-1",
          title: "Reading the Data",
          subtitle: "Interpret a simple chart",
          xp: 20,
          steps: [
            { kind: "intro", title: "Data Detective", body: "Scientists read data to find patterns. Read carefully and extract the facts." },
            {
              kind: "read-choice",
              modality: "reading",
              passage:
                "A class measured rainfall for 4 weeks. Week 1: 10mm. Week 2: 25mm. Week 3: 15mm. Week 4: 30mm. The wettest week had the most rain.",
              prompt: "Which week was the wettest?",
              options: ["Week 1", "Week 2", "Week 3", "Week 4"],
              answer: 3,
            },
            {
              kind: "read-choice",
              modality: "reading",
              passage:
                "A class measured rainfall for 4 weeks. Week 1: 10mm. Week 2: 25mm. Week 3: 15mm. Week 4: 30mm.",
              prompt: "How much MORE rain fell in Week 4 than Week 1?",
              options: ["10mm", "15mm", "20mm", "30mm"],
              answer: 2,
            },
            {
              kind: "write-short",
              modality: "writing",
              prompt: "Describe the overall trend in the rainfall data in your own words.",
              hintText: "Did rain generally go up, down, or stay the same? Mention the numbers.",
              keywords: ["increase", "increased", "up", "rose", "more", "trend", "varied", "changed", "highest", "week"],
              minKeywords: 2,
              sample: "Rainfall generally increased over the four weeks, with Week 4 being the highest at 30mm.",
            },
          ],
        },
        {
          id: "l912-2",
          title: "The Fair Test",
          subtitle: "Read and design an experiment",
          xp: 25,
          steps: [
            { kind: "intro", title: "Scientific Method", body: "A good experiment changes only one thing at a time. Let's reason through it." },
            {
              kind: "read-order",
              modality: "reading",
              prompt: "Put the scientific method steps in order.",
              items: ["Ask a question", "Make a hypothesis", "Run the experiment", "Record results", "Draw a conclusion"],
            },
            {
              kind: "read-choice",
              modality: "reading",
              passage:
                "Liam tests if plants grow taller with more light. He gives Plant A lots of light and Plant B little light. He gives both the same water and soil.",
              prompt: "Why does Liam give both plants the same water and soil?",
              options: [
                "To save money",
                "So light is the only thing that changes",
                "Because plants like water",
                "To make it harder",
              ],
              answer: 1,
            },
            {
              kind: "write-short",
              modality: "writing",
              prompt: "Write a hypothesis for Liam's experiment.",
              hintText: "Use an 'If... then...' sentence about light and plant height.",
              keywords: ["if", "then", "light", "more", "grow", "taller", "plant", "height"],
              minKeywords: 3,
              sample: "If a plant gets more light, then it will grow taller.",
            },
          ],
        },
        {
          id: "l912-3",
          title: "Code Logic",
          subtitle: "Read and write simple logic",
          xp: 25,
          steps: [
            { kind: "intro", title: "Think Like a Coder", body: "Code is a set of clear written instructions. Order and logic matter!" },
            {
              kind: "read-order",
              modality: "reading",
              prompt: "Order the steps for a robot to make a sandwich.",
              items: ["Get two slices of bread", "Spread filling on one slice", "Place the second slice on top", "Cut the sandwich"],
            },
            {
              kind: "write-fill",
              modality: "writing",
              prompt: "Finish the rule: IF it is raining, THEN bring an ____.",
              before: "",
              after: "",
              answers: ["umbrella"],
            },
            {
              kind: "write-short",
              modality: "writing",
              prompt: "Explain why the ORDER of instructions matters when coding.",
              hintText: "Think about what happens if steps are swapped.",
              keywords: ["order", "sequence", "step", "wrong", "before", "after", "result", "work", "fail", "first"],
              minKeywords: 2,
              sample: "Order matters because each step depends on the one before it; the wrong order gives the wrong result.",
            },
          ],
        },
      ],
    },
  ],
}

// ---------------------------------------------------------------------------
// AGES 13-18 — Discovery Lab: academic reading, scientific writing
// ---------------------------------------------------------------------------
const age13to18: AgeContent = {
  age: "13-18",
  label: "Ages 13–18",
  blurb: "Academic reading & scientific writing",
  focus: ["Academic reading", "Technical reading", "Research interpretation", "Scientific writing", "Structured explanations"],
  stem: ["Algebra", "Statistics", "Physics", "Chemistry", "Engineering", "Data Science"],
  worlds: [
    {
      id: "w1318-1",
      title: "Discovery Lab",
      tagline: "Read research, write like a scientist",
      lessons: [
        {
          id: "l1318-1",
          title: "Reading an Abstract",
          subtitle: "Extract findings from research text",
          xp: 25,
          steps: [
            { kind: "intro", title: "Decode the Abstract", body: "Research abstracts pack a lot into a few lines. Read for the key claim and evidence." },
            {
              kind: "read-choice",
              modality: "reading",
              passage:
                "Abstract: Researchers tested whether a 20% increase in study breaks improved test recall. Across 120 students, the break group scored 14% higher on average, with results significant at p < 0.05.",
              prompt: "What is the main finding?",
              options: [
                "Breaks had no effect",
                "More study breaks improved recall",
                "Only 14 students improved",
                "Tests are unreliable",
              ],
              answer: 1,
            },
            {
              kind: "read-choice",
              modality: "reading",
              passage:
                "Across 120 students, the break group scored 14% higher on average, with results significant at p < 0.05.",
              prompt: "What does 'p < 0.05' suggest about the result?",
              options: [
                "It is likely due to chance",
                "It is statistically significant",
                "Only 5 students were tested",
                "The study failed",
              ],
              answer: 1,
            },
            {
              kind: "write-short",
              modality: "writing",
              prompt: "Summarize the study's conclusion in one or two sentences.",
              hintText: "State the variable changed, the effect, and that it was significant.",
              keywords: ["break", "breaks", "recall", "improved", "higher", "significant", "students", "14", "score"],
              minKeywords: 3,
              sample:
                "Increasing study breaks by 20% led to a significant 14% improvement in recall across 120 students.",
            },
          ],
        },
        {
          id: "l1318-2",
          title: "Physics in Words",
          subtitle: "Read a concept, explain it precisely",
          xp: 30,
          steps: [
            { kind: "intro", title: "Newton's Second Law", body: "Strong scientific writing turns equations into clear, precise sentences." },
            {
              kind: "read-choice",
              modality: "reading",
              passage:
                "Newton's second law states that force equals mass times acceleration (F = ma). For a fixed force, a larger mass produces a smaller acceleration.",
              prompt: "If force stays constant and mass increases, acceleration will...",
              options: ["increase", "decrease", "stay the same", "become zero"],
              answer: 1,
            },
            {
              kind: "write-fill",
              modality: "writing",
              prompt: "Complete the equation in words: Force = mass × ____.",
              before: "",
              after: "",
              answers: ["acceleration", "a"],
            },
            {
              kind: "write-short",
              modality: "writing",
              prompt: "Explain F = ma in your own words, using a real example.",
              hintText: "Mention force, mass, acceleration, and a concrete scenario like pushing a cart.",
              keywords: ["force", "mass", "acceleration", "push", "heavier", "lighter", "faster", "slower", "object"],
              minKeywords: 3,
              sample:
                "Force equals mass times acceleration, so pushing a heavier cart with the same force makes it accelerate more slowly than a lighter one.",
            },
          ],
        },
        {
          id: "l1318-3",
          title: "Argue with Evidence",
          subtitle: "Structured scientific writing",
          xp: 30,
          steps: [
            { kind: "intro", title: "Claim, Evidence, Reasoning", body: "Scientific arguments follow a structure: a claim, supporting evidence, and reasoning." },
            {
              kind: "read-order",
              modality: "reading",
              prompt: "Order the parts of a strong scientific argument.",
              items: ["State a claim", "Present evidence", "Explain the reasoning", "Acknowledge limitations"],
            },
            {
              kind: "write-short",
              modality: "writing",
              prompt: "Write a claim-evidence-reasoning statement: Do plants grow faster with fertilizer?",
              hintText: "Make a claim, cite imagined data as evidence, then reason why.",
              keywords: ["claim", "evidence", "because", "data", "grew", "faster", "fertilizer", "control", "average", "reason"],
              minKeywords: 3,
              sample:
                "Claim: fertilizer speeds growth. Evidence: fertilized plants grew 6cm vs 3cm for the control. Reasoning: extra nutrients support faster cell growth.",
            },
          ],
        },
      ],
    },
  ],
}

export const AGE_CONTENT: Record<AgeGroup, AgeContent> = {
  "3-5": age3to5,
  "6-8": age6to8,
  "9-12": age9to12,
  "13-18": age13to18,
}

export const AGE_ORDER: AgeGroup[] = ["3-5", "6-8", "9-12", "13-18"]

export function getAllLessons(age: AgeGroup) {
  return AGE_CONTENT[age].worlds.flatMap((w) => w.lessons)
}

export function findLesson(age: AgeGroup, lessonId: string) {
  return getAllLessons(age).find((l) => l.id === lessonId)
}
