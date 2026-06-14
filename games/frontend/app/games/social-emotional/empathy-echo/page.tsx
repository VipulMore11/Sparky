"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface EmotionalStory {
  id: number;
  title: string;
  context: string;
  character: string;
  emotion: string;
  situation: string;
  challenge: string;
  actions: {
    id: string;
    text: string;
    empathyScore: number;
    outcome: string;
    explanation: string;
    empathyType: 'cognitive' | 'affective' | 'compassionate' | 'dismissive';
  }[];
  category: 'friendship' | 'family' | 'workplace' | 'romantic' | 'stranger' | 'conflict';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  emotionalIntensity: 'low' | 'medium' | 'high';
}

interface StoryResult {
  storyId: number;
  selectedAction: string;
  empathyScore: number;
  empathyType: string;
  reactionTime: number;
  category: string;
  difficulty: string;
}

export default function EmpathyQuest() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [results, setResults] = useState<StoryResult[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [storyStartTime, setStoryStartTime] = useState<number>(0);
  const [showOutcome, setShowOutcome] = useState(false);
  const [selectedAction, setSelectedAction] = useState<typeof stories[0]['actions'][0] | null>(null);

  const stories: EmotionalStory[] = [
    {
      id: 1,
      title: "The Overwhelmed Friend",
      context: "Your close friend Sarah has been struggling with work stress lately.",
      character: "Sarah",
      emotion: "Overwhelmed & Anxious",
      situation: "Sarah calls you crying, saying she can't handle her new job responsibilities and feels like a failure.",
      challenge: "How do you respond to support her emotional needs?",
      category: 'friendship',
      difficulty: 'basic',
      emotionalIntensity: 'high',
      actions: [
        {
          id: 'A',
          text: "Listen actively and validate: 'This sounds really overwhelming. It makes sense you'd feel this way with so much pressure.'",
          empathyScore: 95,
          empathyType: 'affective',
          outcome: "Sarah feels heard and supported. She opens up more about specific challenges.",
          explanation: "Validation and active listening provide emotional safety and encourage further sharing."
        },
        {
          id: 'B',
          text: "Offer solutions immediately: 'You just need to organize better. Have you tried making lists? What about time management apps?'",
          empathyScore: 40,
          empathyType: 'cognitive',
          outcome: "Sarah feels like you don't understand her emotional state and becomes more withdrawn.",
          explanation: "Jumping to solutions without acknowledging emotions can feel dismissive and unsupportive."
        },
        {
          id: 'C',
          text: "Minimize the problem: 'Everyone feels stressed at new jobs. You'll get used to it soon. Don't worry so much!'",
          empathyScore: 15,
          empathyType: 'dismissive',
          outcome: "Sarah feels invalidated and regrets reaching out. She ends the call feeling worse.",
          explanation: "Minimizing emotions dismisses the person's experience and can damage trust."
        },
        {
          id: 'D',
          text: "Share your experience: 'I remember feeling exactly like this at my job. Would it help to talk through what's feeling most overwhelming right now?'",
          empathyScore: 80,
          empathyType: 'compassionate',
          outcome: "Sarah feels less alone and appreciates the relatability. She's ready to discuss specifics.",
          explanation: "Sharing relevant experience shows understanding while keeping focus on their needs."
        }
      ]
    },
    {
      id: 2,
      title: "Family Disappointment",
      context: "Your teenage cousin Jake didn't get into his dream college.",
      character: "Jake",
      emotion: "Disappointed & Defeated",
      situation: "At a family gathering, Jake sits alone looking devastated. He just received his college rejection letter.",
      challenge: "How do you approach and support him during this difficult moment?",
      category: 'family',
      difficulty: 'intermediate',
      emotionalIntensity: 'high',
      actions: [
        {
          id: 'A',
          text: "Give space but show availability: 'I see you're having a tough time. I'm here if you want to talk, or just sit together quietly.'",
          empathyScore: 90,
          empathyType: 'compassionate',
          outcome: "Jake appreciates the non-pressured support and eventually opens up about his feelings.",
          explanation: "Offering presence without pressure respects autonomy while providing emotional availability."
        },
        {
          id: 'B',
          text: "Focus on silver lining: 'This is actually a blessing! You'll find an even better school. Everything happens for a reason!'",
          empathyScore: 25,
          empathyType: 'dismissive',
          outcome: "Jake feels like his disappointment is being invalidated and becomes more isolated.",
          explanation: "Forced positivity can feel dismissive when someone needs to process difficult emotions."
        },
        {
          id: 'C',
          text: "Acknowledge the loss: 'This must be really disappointing. You had your heart set on that school, and it makes sense you'd feel crushed.'",
          empathyScore: 95,
          empathyType: 'affective',
          outcome: "Jake feels understood and begins to share his fears about his future.",
          explanation: "Acknowledging the emotional reality validates the person's experience and opens communication."
        },
        {
          id: 'D',
          text: "Distract with activity: 'Come on, let's go play some video games. No point dwelling on things you can't change.'",
          empathyScore: 35,
          empathyType: 'cognitive',
          outcome: "Jake goes along but feels like his emotions don't matter. The sadness remains unprocessed.",
          explanation: "Distraction without emotional acknowledgment can prevent healthy processing of difficult feelings."
        }
      ]
    },
    {
      id: 3,
      title: "Workplace Conflict",
      context: "Your colleague Maria is visibly upset after a difficult meeting with your boss.",
      character: "Maria",
      emotion: "Angry & Humiliated",
      situation: "Maria was publicly criticized in the meeting for a project delay that wasn't entirely her fault. She's now sitting at her desk, clearly upset.",
      challenge: "How do you approach this delicate workplace situation?",
      category: 'workplace',
      difficulty: 'advanced',
      emotionalIntensity: 'medium',
      actions: [
        {
          id: 'A',
          text: "Private validation: Approach quietly and say, 'That meeting seemed really tough. Are you okay? Want to grab coffee and talk about it?'",
          empathyScore: 85,
          empathyType: 'compassionate',
          outcome: "Maria appreciates the private support and feels less alone in the situation.",
          explanation: "Private validation in workplace settings shows care while respecting professional boundaries."
        },
        {
          id: 'B',
          text: "Public support: 'I can't believe how unfair that was! Everyone saw that wasn't your fault. The boss was totally out of line!'",
          empathyScore: 45,
          empathyType: 'affective',
          outcome: "While Maria appreciates the support, the public nature makes the situation more uncomfortable.",
          explanation: "Public emotional support in workplace conflicts can escalate situations and create more problems."
        },
        {
          id: 'C',
          text: "Professional distance: Continue working normally without acknowledging the situation.",
          empathyScore: 20,
          empathyType: 'dismissive',
          outcome: "Maria feels isolated and unsupported by her colleagues.",
          explanation: "Ignoring obvious emotional distress can damage relationships and team cohesion."
        },
        {
          id: 'D',
          text: "Practical focus: 'Let's figure out how to fix this project timeline so it doesn't happen again. What do you think went wrong?'",
          empathyScore: 60,
          empathyType: 'cognitive',
          outcome: "Maria appreciates the problem-solving approach but still feels emotionally unaddressed.",
          explanation: "Focusing solely on practical solutions can miss the emotional impact of difficult situations."
        }
      ]
    },
    {
      id: 4,
      title: "New Parent Struggles",
      context: "Your friend Alex just had their first baby and is struggling with the transition.",
      character: "Alex",
      emotion: "Exhausted & Overwhelmed",
      situation: "Alex confides that they love their baby but feel completely overwhelmed, sleep-deprived, and sometimes question if they're cut out for parenting.",
      challenge: "How do you support a new parent experiencing these vulnerable feelings?",
      category: 'friendship',
      difficulty: 'intermediate',
      emotionalIntensity: 'high',
      actions: [
        {
          id: 'A',
          text: "Normalize the experience: 'What you're feeling is so normal. Being a new parent is incredibly overwhelming, and it doesn't mean you're not a good parent.'",
          empathyScore: 95,
          empathyType: 'compassionate',
          outcome: "Alex feels relieved and less guilty about their struggles. They open up about specific challenges.",
          explanation: "Normalizing difficult parenting feelings reduces shame and provides emotional relief."
        },
        {
          id: 'B',
          text: "Focus on the positive: 'But look at this beautiful baby! You're so lucky! These are the best days of your life!'",
          empathyScore: 20,
          empathyType: 'dismissive',
          outcome: "Alex feels worse about their negative feelings and more isolated in their struggle.",
          explanation: "Forcing positivity when someone is struggling can increase feelings of guilt and inadequacy."
        },
        {
          id: 'C',
          text: "Offer practical help: 'This sounds really hard. Can I bring you dinner this week or help with laundry? What would be most helpful?'",
          empathyScore: 85,
          empathyType: 'compassionate',
          outcome: "Alex feels supported both emotionally and practically. They accept help gratefully.",
          explanation: "Combining emotional validation with practical support addresses multiple needs effectively."
        },
        {
          id: 'D',
          text: "Share comparison: 'My sister had a much harder time. At least your baby sleeps sometimes! Some people have it way worse.'",
          empathyScore: 25,
          empathyType: 'dismissive',
          outcome: "Alex feels like their struggles don't matter and stops sharing their feelings.",
          explanation: "Comparisons minimize personal experiences and can shut down emotional sharing."
        }
      ]
    },
    {
      id: 5,
      title: "Breakup Support",
      context: "Your friend Sam is going through a difficult breakup after a 3-year relationship.",
      character: "Sam",
      emotion: "Heartbroken & Lost",
      situation: "Sam's partner ended their relationship unexpectedly. Sam feels lost, questioning everything, and wondering if they'll ever find love again.",
      challenge: "How do you support someone through heartbreak while respecting their healing process?",
      category: 'romantic',
      difficulty: 'advanced',
      emotionalIntensity: 'high',
      actions: [
        {
          id: 'A',
          text: "Validate the pain: 'This must be absolutely devastating. Losing someone you loved is one of the hardest things to go through.'",
          empathyScore: 95,
          empathyType: 'affective',
          outcome: "Sam feels understood and supported. They express gratitude for your acknowledgment of their pain.",
          explanation: "Validating the depth of heartbreak shows understanding and provides emotional safety."
        },
        {
          id: 'B',
          text: "Encourage moving on: 'You're better off without them! There are plenty of fish in the sea. You should get back out there!'",
          empathyScore: 30,
          empathyType: 'dismissive',
          outcome: "Sam feels pressured and misunderstood. They're not ready to think about moving on.",
          explanation: "Rushing the healing process can invalidate the grief and complicate emotional recovery."
        },
        {
          id: 'C',
          text: "Listen and be present: 'I'm here for you. Do you want to talk about what happened, or would you prefer we just spend time together?'",
          empathyScore: 90,
          empathyType: 'compassionate',
          outcome: "Sam appreciates having control over the conversation and feels supported without pressure.",
          explanation: "Offering presence and choice empowers the person while providing reliable support."
        },
        {
          id: 'D',
          text: "Analyze the relationship: 'You know, I always thought you two had some issues. Maybe this is for the best in the long run.'",
          empathyScore: 15,
          empathyType: 'cognitive',
          outcome: "Sam feels judged and defensive about their relationship. They stop sharing their feelings.",
          explanation: "Analyzing or criticizing past relationships when someone is grieving can feel insensitive and judgmental."
        }
      ]
    },
    {
      id: 6,
      title: "Elderly Neighbor's Loneliness",
      context: "Your elderly neighbor Mrs. Chen seems increasingly isolated and sad.",
      character: "Mrs. Chen",
      emotion: "Lonely & Forgotten",
      situation: "You notice Mrs. Chen spending most days alone on her porch, looking sad. She mentions that her children rarely visit and she feels forgotten.",
      challenge: "How do you respond to an elderly person expressing loneliness and social isolation?",
      category: 'stranger',
      difficulty: 'intermediate',
      emotionalIntensity: 'medium',
      actions: [
        {
          id: 'A',
          text: "Acknowledge and offer connection: 'That sounds really lonely. Would you like some company? I could visit sometimes or we could have tea together.'",
          empathyScore: 90,
          empathyType: 'compassionate',
          outcome: "Mrs. Chen feels valued and appreciated. She eagerly accepts your offer of friendship.",
          explanation: "Acknowledging loneliness and offering genuine connection addresses the core emotional need."
        },
        {
          id: 'B',
          text: "Give advice: 'You should call your children more often. Maybe they're just busy. Have you tried joining a senior center?'",
          empathyScore: 45,
          empathyType: 'cognitive',
          outcome: "Mrs. Chen feels like you don't understand her situation and becomes defensive about her family.",
          explanation: "Giving advice without understanding the full situation can feel dismissive of complex emotions."
        },
        {
          id: 'C',
          text: "Minimize the feeling: 'Oh, I'm sure your family loves you! Everyone gets busy these days. Things will get better!'",
          empathyScore: 25,
          empathyType: 'dismissive',
          outcome: "Mrs. Chen feels like her real experience is being dismissed and stops sharing her feelings.",
          explanation: "Minimizing loneliness dismisses a real and painful emotional experience."
        },
        {
          id: 'D',
          text: "Listen with empathy: 'That must be really difficult, feeling disconnected from your family. Loneliness can be so painful. Tell me more about what that's like for you.'",
          empathyScore: 95,
          empathyType: 'affective',
          outcome: "Mrs. Chen feels deeply heard and understood. She opens up about her specific experiences and fears.",
          explanation: "Deep listening and empathetic inquiry validates the emotional experience and encourages sharing."
        }
      ]
    },
    {
      id: 7,
      title: "Teen Identity Crisis",
      context: "Your younger sibling Jordan is struggling with identity and self-acceptance.",
      character: "Jordan",
      emotion: "Confused & Insecure",
      situation: "Jordan confides that they don't know who they are, feel like they don't fit in anywhere, and are questioning everything about themselves.",
      challenge: "How do you support a teenager going through identity exploration and self-doubt?",
      category: 'family',
      difficulty: 'advanced',
      emotionalIntensity: 'high',
      actions: [
        {
          id: 'A',
          text: "Normalize the journey: 'Identity exploration is such a normal part of growing up. It's okay not to have everything figured out right now.'",
          empathyScore: 85,
          empathyType: 'compassionate',
          outcome: "Jordan feels relieved that their confusion is normal and opens up about specific concerns.",
          explanation: "Normalizing identity exploration reduces anxiety and provides developmental context."
        },
        {
          id: 'B',
          text: "Give direction: 'You just need to focus on your studies and stop overthinking. You're fine just the way you are!'",
          empathyScore: 30,
          empathyType: 'dismissive',
          outcome: "Jordan feels like their genuine struggles are being dismissed and stops seeking support.",
          explanation: "Dismissing identity struggles can invalidate important developmental processes."
        },
        {
          id: 'C',
          text: "Explore with curiosity: 'That sounds really challenging. What parts of yourself feel most confusing right now? I'm here to listen without judgment.'",
          empathyScore: 95,
          empathyType: 'affective',
          outcome: "Jordan feels safe to explore their feelings and begins sharing specific identity questions.",
          explanation: "Curious, non-judgmental exploration provides safe space for identity development."
        },
        {
          id: 'D',
          text: "Share your experience: 'I went through the same thing. Here's what helped me figure things out...'",
          empathyScore: 65,
          empathyType: 'cognitive',
          outcome: "Jordan appreciates the sharing but feels like their unique experience isn't fully understood.",
          explanation: "Sharing personal experience can help but may overshadow the individual's unique journey."
        }
      ]
    },
    {
      id: 8,
      title: "Workplace Discrimination",
      context: "Your colleague David confides about experiencing workplace discrimination.",
      character: "David",
      emotion: "Angry & Demoralized",
      situation: "David shares that he's been passed over for promotions and feels it's due to his background. He's losing motivation and considering leaving.",
      challenge: "How do you respond to someone experiencing discrimination and systemic unfairness?",
      category: 'workplace',
      difficulty: 'advanced',
      emotionalIntensity: 'high',
      actions: [
        {
          id: 'A',
          text: "Validate and support: 'That's completely unacceptable and wrong. Your feelings are valid, and I believe your experience. How can I support you?'",
          empathyScore: 95,
          empathyType: 'affective',
          outcome: "David feels believed and supported. He discusses potential next steps with your backing.",
          explanation: "Believing and validating discrimination experiences provides crucial emotional support and empowerment."
        },
        {
          id: 'B',
          text: "Question the interpretation: 'Are you sure it's discrimination? Maybe there are other factors. Have you considered that your qualifications might need work?'",
          empathyScore: 10,
          empathyType: 'dismissive',
          outcome: "David feels invalidated and regrets sharing his experience. Trust is damaged.",
          explanation: "Questioning discrimination experiences can retraumatize and invalidate real injustices."
        },
        {
          id: 'C',
          text: "Focus on solutions: 'You should document everything and report it to HR. Have you considered legal action? Here's what you need to do...'",
          empathyScore: 60,
          empathyType: 'cognitive',
          outcome: "David appreciates the practical advice but feels like the emotional impact isn't acknowledged.",
          explanation: "Jumping to solutions without emotional validation can miss the trauma of discrimination experiences."
        },
        {
          id: 'D',
          text: "Listen deeply: 'This must be incredibly frustrating and demoralizing. Tell me more about what you've been experiencing.'",
          empathyScore: 90,
          empathyType: 'compassionate',
          outcome: "David feels heard and begins to process the emotional impact while feeling supported.",
          explanation: "Deep listening validates the experience and allows processing of complex emotions around injustice."
        }
      ]
    }
  ];

  const startGame = () => {
    setGameStarted(true);
    setGameComplete(false);
    setResults([]);
    setCurrentStoryIndex(0);
    setShowOutcome(false);
    setSelectedAction(null);
    setStoryStartTime(performance.now());
  };

  const handleActionChoice = useCallback((action: typeof stories[0]['actions'][0]) => {
    const reactionTime = performance.now() - storyStartTime;
    const currentStory = stories[currentStoryIndex];
    
    setSelectedAction(action);
    
    const result: StoryResult = {
      storyId: currentStory.id,
      selectedAction: action.id,
      empathyScore: action.empathyScore,
      empathyType: action.empathyType,
      reactionTime,
      category: currentStory.category,
      difficulty: currentStory.difficulty
    };
    
    setResults(prev => [...prev, result]);
    setShowOutcome(true);
    
    // Auto-advance after showing outcome
    setTimeout(() => {
      const nextIndex = currentStoryIndex + 1;
      if (nextIndex >= stories.length) {
        setGameComplete(true);
        setGameStarted(false);
      } else {
        setCurrentStoryIndex(nextIndex);
        setShowOutcome(false);
        setSelectedAction(null);
        setStoryStartTime(performance.now());
      }
    }, 5000);
  }, [currentStoryIndex, storyStartTime]);

  // Calculate statistics
  const averageEmpathyScore = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.empathyScore, 0) / results.length)
    : 0;
  
  const empathyTypeStats = ['affective', 'cognitive', 'compassionate', 'dismissive'].map(type => {
    const typeResults = results.filter(r => r.empathyType === type);
    return {
      type,
      count: typeResults.length,
      percentage: results.length > 0 ? Math.round((typeResults.length / results.length) * 100) : 0
    };
  });

  const categoryStats = ['friendship', 'family', 'workplace', 'romantic', 'stranger', 'conflict'].map(category => {
    const categoryResults = results.filter(r => r.category === category);
    const avgScore = categoryResults.length > 0 
      ? Math.round(categoryResults.reduce((sum, r) => sum + r.empathyScore, 0) / categoryResults.length)
      : 0;
    return {
      category,
      avgScore,
      count: categoryResults.length
    };
  });

  const getEmpathyLevel = () => {
    if (averageEmpathyScore >= 85) return { level: 'Highly Empathetic', color: 'text-green-600', desc: 'Exceptional emotional understanding and responsiveness' };
    if (averageEmpathyScore >= 70) return { level: 'Empathetic', color: 'text-blue-600', desc: 'Strong emotional awareness and supportive responses' };
    if (averageEmpathyScore >= 55) return { level: 'Developing', color: 'text-orange-600', desc: 'Growing empathy with room for improvement' };
    return { level: 'Learning', color: 'text-red-600', desc: 'Beginning to develop empathetic response skills' };
  };

  const empathyLevel = getEmpathyLevel();
  const currentStory = stories[currentStoryIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games" className="text-blue-600 hover:text-blue-800">
              ← Back to Games
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💝</span>
              <Badge variant="secondary">Empathy & Social Cognition</Badge>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Empathy Quest
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Navigate emotional social stories and choose the most empathetic responses
          </p>
        </CardHeader>

        <CardContent>
          {!gameStarted && !gameComplete && (
            <div className="text-center space-y-6">
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-purple-900">How Empathy Quest Works</h3>
                <div className="text-left space-y-3 text-purple-800">
                  <p>• Read emotional social stories featuring people in challenging situations</p>
                  <p>• Choose from 4 different response options for each scenario</p>
                  <p>• Learn about different types of empathy: affective, cognitive, and compassionate</p>
                  <p>• Discover your empathy profile across various relationship contexts</p>
                  <p>• Receive detailed feedback on the emotional impact of your choices</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="text-sm font-medium">Friendship</div>
                  <div className="text-xs text-gray-500">Support & Connection</div>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-2xl mb-2">👨‍👩‍👧‍👦</div>
                  <div className="text-sm font-medium">Family</div>
                  <div className="text-xs text-gray-500">Understanding & Care</div>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-2xl mb-2">💼</div>
                  <div className="text-sm font-medium">Workplace</div>
                  <div className="text-xs text-gray-500">Professional Support</div>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-2xl mb-2">💕</div>
                  <div className="text-sm font-medium">Relationships</div>
                  <div className="text-xs text-gray-500">Emotional Intimacy</div>
                </div>
              </div>
              
              <Button 
                onClick={startGame}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3"
              >
                Begin Empathy Quest ({stories.length} Stories)
              </Button>
              
              <div className="text-sm text-gray-500">
                <p>
                  <strong>Duration:</strong> 15-20 minutes • <strong>Stories:</strong> {stories.length} scenarios
                </p>
              </div>
            </div>
          )}

          {gameStarted && !showOutcome && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Story {currentStoryIndex + 1} of {stories.length}
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {currentStory.category.charAt(0).toUpperCase() + currentStory.category.slice(1)}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {currentStory.difficulty.charAt(0).toUpperCase() + currentStory.difficulty.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <Progress 
                value={(currentStoryIndex / stories.length) * 100} 
                className="w-full"
              />

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {currentStory.title}
                    </h3>
                    
                    <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-blue-400">
                      <p className="text-gray-700 mb-3">
                        <strong>Context:</strong> {currentStory.context}
                      </p>
                      <p className="text-gray-700">
                        <strong>Situation:</strong> {currentStory.situation}
                      </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">😔</div>
                        <div>
                          <span className="text-amber-800 font-medium">{currentStory.character} is feeling: </span>
                          <span className="text-amber-700 font-semibold">{currentStory.emotion}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">Your Challenge:</h4>
                      <p className="text-purple-800">{currentStory.challenge}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900">How do you respond?</h4>
                    {currentStory.actions.map((action) => (
                      <Button
                        key={action.id}
                        variant="outline"
                        className="text-left h-auto p-4 hover:bg-blue-50 transition-colors w-full"
                        onClick={() => handleActionChoice(action)}
                      >
                        <div className="w-full">
                          <div className="flex items-start gap-3">
                            <span className="font-bold text-blue-600 flex-shrink-0 mt-1">
                              {action.id}.
                            </span>
                            <span className="text-sm text-gray-800 text-left">
                              {action.text}
                            </span>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {showOutcome && selectedAction && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-4">
                  {selectedAction.empathyScore >= 80 ? '💝' : selectedAction.empathyScore >= 60 ? '💙' : selectedAction.empathyScore >= 40 ? '💛' : '💔'}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Choice: Option {selectedAction.id}</h3>
                <div className="text-lg text-gray-700 mb-4 max-w-3xl mx-auto">
                  "{selectedAction.text}"
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-green-900 mb-3">📊 Response Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-green-800">Empathy Score:</span>
                        <span className={`font-bold ${selectedAction.empathyScore >= 80 ? 'text-green-600' : selectedAction.empathyScore >= 60 ? 'text-blue-600' : selectedAction.empathyScore >= 40 ? 'text-orange-600' : 'text-red-600'}`}>
                          {selectedAction.empathyScore}/100
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-800">Empathy Type:</span>
                        <Badge variant={selectedAction.empathyType === 'dismissive' ? 'destructive' : 'secondary'}>
                          {selectedAction.empathyType.charAt(0).toUpperCase() + selectedAction.empathyType.slice(1)}
                        </Badge>
                      </div>
                      <Progress value={selectedAction.empathyScore} className="mt-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-blue-900 mb-3">🎭 Emotional Outcome</h4>
                    <p className="text-blue-800 text-sm">
                      {selectedAction.outcome}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-purple-900 mb-3">💡 Learning Insight</h4>
                  <p className="text-purple-800">
                    {selectedAction.explanation}
                  </p>
                </CardContent>
              </Card>

              <div className="text-center text-gray-600">
                {currentStoryIndex + 1 < stories.length ? (
                  <p>Next story in 5 seconds...</p>
                ) : (
                  <p>Calculating your empathy profile...</p>
                )}
              </div>
            </div>
          )}

          {gameComplete && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Empathy Quest Complete!
                </h3>
                <div className={`text-xl font-semibold ${empathyLevel.color} mb-2`}>
                  {empathyLevel.level}
                </div>
                <p className="text-gray-700">{empathyLevel.desc}</p>
              </div>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {averageEmpathyScore}/100
                    </div>
                    <div className="text-gray-600">Average Empathy Score</div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Empathy Response Profile</h4>
                    {empathyTypeStats.filter(stat => stat.count > 0).map(stat => (
                      <div key={stat.type} className="flex justify-between items-center">
                        <span className="capitalize text-gray-700">{stat.type} Empathy</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full" 
                              style={{ width: `${stat.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12">{stat.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-blue-900 mb-4">📈 Category Performance</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {categoryStats.filter(stat => stat.count > 0).map(stat => (
                      <div key={stat.category} className="text-center p-3 bg-white rounded border">
                        <div className="capitalize font-medium text-gray-800">{stat.category}</div>
                        <div className="text-2xl font-bold text-blue-600">{stat.avgScore}</div>
                        <div className="text-xs text-gray-500">({stat.count} stories)</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-green-900 mb-3">🌟 Empathy Insights</h4>
                  <div className="space-y-2 text-green-800">
                    {averageEmpathyScore >= 85 && (
                      <p>• You demonstrate exceptional emotional understanding and supportive responses</p>
                    )}
                    {(empathyTypeStats.find(s => s.type === 'affective')?.percentage || 0) >= 40 && (
                      <p>• Strong in affective empathy - you deeply feel others' emotions</p>
                    )}
                    {(empathyTypeStats.find(s => s.type === 'compassionate')?.percentage || 0) >= 40 && (
                      <p>• Excellent compassionate empathy - you're motivated to help others</p>
                    )}
                    {(empathyTypeStats.find(s => s.type === 'cognitive')?.percentage || 0) >= 40 && (
                      <p>• Good cognitive empathy - you understand others' perspectives well</p>
                    )}
                    {(categoryStats.find(s => s.category === 'workplace')?.avgScore || 0) >= 80 && (
                      <p>• Exceptional workplace emotional intelligence</p>
                    )}
                    {averageEmpathyScore < 60 && (
                      <p>• Consider practicing active listening and emotional validation techniques</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  Take Quest Again
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/games">Back to Games</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}