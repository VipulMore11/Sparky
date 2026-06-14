"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface Question {
  id: number;
  type: 'expression_match' | 'emotion_identify' | 'situation_emotion' | 'intensity_scale' | 'micro_expression' | 'empathy_assessment' | 'emotional_regulation';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  scenario?: string;
  emotionImage?: string;
  category: 'basic' | 'complex' | 'social' | 'situational' | 'professional' | 'interpersonal';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  competency: 'recognition' | 'understanding' | 'management' | 'application';
  evidenceBased?: string;
}

interface QuestionResult {
  questionId: number;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  reactionTime: number;
  category: string;
  type: string;
}

export default function MoodMirror() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const questions: Question[] = [
    // BASIC EMOTIONAL RECOGNITION (Beginner Level)
    {
      id: 1,
      type: 'expression_match',
      category: 'basic',
      difficulty: 'beginner',
      competency: 'recognition',
      question: 'According to the Facial Action Coding System (FACS), which combination of facial movements indicates genuine happiness?',
      emotionImage: '😊',
      options: [
        'Zygomatic major activation only (mouth corners up)',
        'Orbicularis oculi and zygomatic major activation (eyes crinkle + mouth up)',
        'Levator labii superioris activation (upper lip raise)',
        'Mentalis activation (chin raise)'
      ],
      correctAnswer: 1,
      explanation: 'Genuine happiness (Duchenne smile) requires both zygomatic major (mouth) and orbicularis oculi (eye) muscle activation, creating crow\'s feet and eye crinkles.',
      evidenceBased: 'Paul Ekman\'s research on facial expressions (1970s)'
    },
    {
      id: 2,
      type: 'micro_expression',
      category: 'basic',
      difficulty: 'intermediate',
      competency: 'recognition',
      question: 'Micro-expressions occur within what timeframe and are significant because they:',
      options: [
        '1-2 seconds; show controlled emotions',
        '1/25th to 1/5th of a second; reveal concealed emotions',
        '3-5 seconds; indicate emotional intensity',
        '1/10th to 1/2 second; show cultural expressions'
      ],
      correctAnswer: 1,
      explanation: 'Micro-expressions last 1/25th to 1/5th of a second and occur involuntarily, revealing true emotions before conscious control suppresses them.',
      evidenceBased: 'Paul Ekman & Wallace Friesen micro-expression research'
    },
    {
      id: 3,
      type: 'emotion_identify',
      category: 'complex',
      difficulty: 'intermediate',
      competency: 'understanding',
      question: 'A colleague displays contempt through asymmetrical expression. What does this specifically indicate about their emotional state?',
      options: [
        'Mild disagreement or skepticism',
        'Feeling morally or intellectually superior',
        'Confusion about the situation',
        'Suppressed anger or frustration'
      ],
      correctAnswer: 1,
      explanation: 'Contempt, shown by unilateral lip corner raise, indicates feelings of moral or intellectual superiority and is the only asymmetrical universal expression.',
      evidenceBased: 'Ekman & Friesen universal emotion research'
    },
    {
      id: 4,
      type: 'situation_emotion',
      category: 'professional',
      difficulty: 'advanced',
      competency: 'application',
      question: 'During performance review, an employee shows baseline facial expression but demonstrates adaptor behaviors (touching face/neck). This suggests:',
      scenario: 'Professional performance evaluation',
      options: [
        'Complete comfort and confidence',
        'Cognitive load and stress despite controlled expression',
        'Disagreement with the evaluation',
        'Lack of engagement or interest'
      ],
      correctAnswer: 1,
      explanation: 'Adaptor behaviors (self-touching) indicate psychological stress and cognitive load, even when facial expressions remain controlled.',
      evidenceBased: 'Nonverbal behavior research by Ekman & Friesen'
    },
    {
      id: 5,
      type: 'empathy_assessment',
      category: 'interpersonal',
      difficulty: 'advanced',
      competency: 'understanding',
      question: 'You notice a team member\'s voice pitch has risen, speech rate increased, but they maintain a calm facial expression. Your most emotionally intelligent response would be:',
      scenario: 'Team collaboration meeting',
      options: [
        'Continue the conversation normally since they appear calm',
        'Acknowledge potential stress: "I notice this topic might be bringing up some concerns"',
        'Point out the inconsistency directly: "You seem stressed despite looking calm"',
        'Change the subject to reduce their discomfort'
      ],
      correctAnswer: 1,
      explanation: 'Emotionally intelligent responses acknowledge incongruent emotional signals while providing safe space for authentic expression.',
      evidenceBased: 'Daniel Goleman\'s Emotional Intelligence framework'
    },
    {
      id: 6,
      type: 'emotional_regulation',
      category: 'professional',
      difficulty: 'expert',
      competency: 'management',
      question: 'When experiencing emotional contagion from an angry client, the most professionally effective strategy is:',
      scenario: 'Client service interaction',
      options: [
        'Mirror their emotional state to show empathy',
        'Suppress your emotional response completely',
        'Use cognitive reappraisal while maintaining empathetic validation',
        'Excuse yourself from the interaction immediately'
      ],
      correctAnswer: 2,
      explanation: 'Cognitive reappraisal (reframing the situation) prevents emotional contagion while empathetic validation maintains professional rapport.',
      evidenceBased: 'James Gross emotion regulation research'
    },
    {
      id: 7,
      type: 'situation_emotion',
      category: 'interpersonal',
      difficulty: 'intermediate',
      competency: 'understanding',
      question: 'In cross-cultural communication, someone avoids direct eye contact during praise. This behavior most likely indicates:',
      scenario: 'International team recognition',
      options: [
        'Discomfort or disagreement with the praise',
        'Cultural respect and humility (high-context culture)',
        'Lack of confidence or low self-esteem',
        'Deception about their contributions'
      ],
      correctAnswer: 1,
      explanation: 'Many high-context cultures view direct eye contact during praise as disrespectful or presumptuous, reflecting cultural humility rather than discomfort.',
      evidenceBased: 'Edward T. Hall\'s cultural context theory'
    },
    {
      id: 8,
      type: 'micro_expression',
      category: 'complex',
      difficulty: 'expert',
      competency: 'recognition',
      question: 'A person shows a brief flash of fear (raised upper eyelids, tensed lower eyelids) followed immediately by a confident expression. This sequence suggests:',
      options: [
        'Normal emotional fluctuation',
        'Initial apprehension being consciously managed',
        'Mixed emotions about the situation',
        'Deceptive behavior or concealment'
      ],
      correctAnswer: 1,
      explanation: 'Fear micro-expressions followed by controlled confidence indicate initial apprehension being consciously regulated through emotional management.',
      evidenceBased: 'Micro-expression training research by Matsumoto & Hwang'
    },
    {
      id: 9,
      type: 'empathy_assessment',
      category: 'interpersonal',
      difficulty: 'advanced',
      competency: 'application',
      question: 'A colleague consistently provides solutions when others express problems, despite their body language suggesting they want emotional support. This demonstrates:',
      scenario: 'Workplace peer support',
      options: [
        'High emotional intelligence and helpfulness',
        'Cognitive empathy but limited affective empathy',
        'Effective problem-solving leadership',
        'Appropriate professional boundaries'
      ],
      correctAnswer: 1,
      explanation: 'Understanding others\' problems (cognitive empathy) while missing their emotional needs (affective empathy) shows imbalanced emotional intelligence.',
      evidenceBased: 'Baron-Cohen\'s empathy research and EQ theory'
    },
    {
      id: 10,
      type: 'emotional_regulation',
      category: 'professional',
      difficulty: 'expert',
      competency: 'management',
      question: 'During a heated team conflict, you notice your own physiological arousal increasing (heart rate, tension). The most effective emotional regulation strategy is:',
      scenario: 'Team conflict mediation',
      options: [
        'Suppress physiological responses and continue normally',
        'Take a brief pause for physiological regulation, then use perspective-taking',
        'Express your frustration to model emotional authenticity',
        'Remove yourself from the situation until completely calm'
      ],
      correctAnswer: 1,
      explanation: 'Physiological regulation (breathing, brief pause) followed by cognitive strategies (perspective-taking) optimizes emotional management in conflict.',
      evidenceBased: 'Gross & Thompson emotion regulation model'
    },
    {
      id: 11,
      type: 'situation_emotion',
      category: 'professional',
      difficulty: 'advanced',
      competency: 'application',
      question: 'In a negotiation, the other party displays confident verbal communication but shows pacifying behaviors (touching jewelry, adjusting clothing). Your strategy should be:',
      scenario: 'Business negotiation',
      options: [
        'Challenge their confidence directly',
        'Provide reassurance and reduce perceived pressure',
        'Maintain pressure since they appear nervous',
        'Ignore the nonverbal cues and focus on verbal content'
      ],
      correctAnswer: 1,
      explanation: 'Pacifying behaviors indicate stress despite confident verbal presentation. Reducing pressure can lead to more authentic communication and better outcomes.',
      evidenceBased: 'Joe Navarro\'s nonverbal behavior research'
    },
    {
      id: 12,
      type: 'empathy_assessment',
      category: 'interpersonal',
      difficulty: 'intermediate',
      competency: 'understanding',
      question: 'Someone shares good news with subdued enthusiasm. The most empathetically intelligent response demonstrates:',
      scenario: 'Personal achievement sharing',
      options: [
        'Match their energy level: "That\'s nice, congratulations"',
        'Boost enthusiasm: "That\'s amazing! You should be so excited!"',
        'Explore underlying factors: "Congratulations! How are you feeling about it?"',
        'Focus on practical implications: "What does this mean for your career?"'
      ],
      correctAnswer: 2,
      explanation: 'Empathetic intelligence recognizes incongruent emotional expression and creates space to explore underlying feelings without imposing expected emotions.',
      evidenceBased: 'Carl Rogers\' person-centered empathy research'
    },
    {
      id: 13,
      type: 'expression_match',
      category: 'complex',
      difficulty: 'expert',
      competency: 'recognition',
      question: 'Disgust expressions involve specific muscle activations. Which combination correctly identifies disgust according to FACS coding?',
      options: [
        'AU4 (brow lowerer) + AU15 (lip corner depressor)',
        'AU9 (nose wrinkler) + AU15 (lip corner depressor) + AU16 (lower lip depressor)',
        'AU12 (lip corner puller) + AU25 (lips part)',
        'AU1 (inner brow raiser) + AU4 (brow lowerer)'
      ],
      correctAnswer: 1,
      explanation: 'Disgust is characterized by nose wrinkle (AU9), lip corner depression (AU15), and lower lip depression (AU16), creating the characteristic "disgust face."',
      evidenceBased: 'Facial Action Coding System (FACS) by Ekman & Friesen'
    },
    {
      id: 14,
      type: 'emotional_regulation',
      category: 'interpersonal',
      difficulty: 'advanced',
      competency: 'management',
      question: 'When someone displays emotional dysregulation (intense emotion disproportionate to trigger), the most supportive approach is:',
      scenario: 'Supporting distressed colleague',
      options: [
        'Provide logical perspective to reduce their emotional intensity',
        'Validate their emotional experience while offering regulatory support',
        'Give them space until they self-regulate',
        'Match their emotional intensity to show solidarity'
      ],
      correctAnswer: 1,
      explanation: 'Emotional validation combined with regulatory support (breathing, grounding) helps others develop self-regulation skills without dismissing their experience.',
      evidenceBased: 'Dialectical Behavior Therapy research by Marsha Linehan'
    },
    {
      id: 15,
      type: 'situation_emotion',
      category: 'professional',
      difficulty: 'expert',
      competency: 'application',
      question: 'A high-performer suddenly shows decreased facial expressiveness, delayed verbal responses, and minimal spontaneous communication. This pattern suggests:',
      scenario: 'Performance management assessment',
      options: [
        'Increased focus and concentration',
        'Possible burnout or emotional exhaustion',
        'Professional maturity and composure',
        'Disagreement with current projects'
      ],
      correctAnswer: 1,
      explanation: 'Decreased expressiveness, delayed responses, and reduced spontaneous communication are early indicators of emotional exhaustion and burnout.',
      evidenceBased: 'Christina Maslach burnout research and emotional labor theory'
    },
    {
      id: 16,
      type: 'micro_expression',
      category: 'complex',
      difficulty: 'expert',
      competency: 'recognition',
      question: 'Flash expressions of sadness (brief inner brow raise, lip corner depress) during positive conversations typically indicate:',
      options: [
        'Momentary distraction or mind-wandering',
        'Underlying grief or loss being consciously managed',
        'Empathetic resonance with others\' experiences',
        'Physical discomfort or fatigue'
      ],
      correctAnswer: 1,
      explanation: 'Sadness micro-expressions during positive contexts often reveal underlying grief or loss that the person is consciously managing or suppressing.',
      evidenceBased: 'Grief processing research and micro-expression studies'
    },
    {
      id: 17,
      type: 'empathy_assessment',
      category: 'interpersonal',
      difficulty: 'expert',
      competency: 'application',
      question: 'You notice someone\'s breathing pattern has changed (shorter, higher) during discussion of a sensitive topic. Your response should prioritize:',
      scenario: 'Sensitive topic discussion',
      options: [
        'Continuing the conversation to avoid making them self-conscious',
        'Offering physiological support: "Let\'s take a moment to breathe"',
        'Changing topics immediately to reduce stress',
        'Asking directly: "Are you feeling anxious about this topic?"'
      ],
      correctAnswer: 1,
      explanation: 'Physiological changes indicate stress activation. Offering breathing support addresses the physiological response while maintaining emotional safety.',
      evidenceBased: 'Polyvagal theory by Stephen Porges and trauma-informed care'
    },
    {
      id: 18,
      type: 'emotional_regulation',
      category: 'professional',
      difficulty: 'expert',
      competency: 'management',
      question: 'When experiencing secondary trauma from repeatedly hearing difficult client stories, the most sustainable emotional strategy is:',
      scenario: 'Healthcare/counseling professional context',
      options: [
        'Emotional compartmentalization during work hours',
        'Developing cognitive-emotional integration with professional support',
        'Increasing emotional distance from client experiences',
        'Processing all emotions immediately as they arise'
      ],
      correctAnswer: 1,
      explanation: 'Cognitive-emotional integration with professional support prevents compartmentalization harm while maintaining empathetic engagement and preventing burnout.',
      evidenceBased: 'Secondary trauma research and professional emotional labor studies'
    },
    {
      id: 19,
      type: 'situation_emotion',
      category: 'interpersonal',
      difficulty: 'advanced',
      competency: 'understanding',
      question: 'In group dynamics, someone consistently displays emotional expressions 2-3 seconds after others (delayed emotional contagion). This suggests:',
      scenario: 'Group meeting dynamics',
      options: [
        'Social anxiety or uncertainty about appropriate responses',
        'High emotional intelligence and thoughtful responses',
        'Lack of attention or engagement',
        'Cultural differences in emotional expression'
      ],
      correctAnswer: 0,
      explanation: 'Delayed emotional contagion often indicates social anxiety or uncertainty about appropriate emotional responses in group settings.',
      evidenceBased: 'Social anxiety research and emotional contagion studies'
    },
    {
      id: 20,
      type: 'empathy_assessment',
      category: 'professional',
      difficulty: 'expert',
      competency: 'application',
      question: 'A direct report shows high performance but exhibits stress indicators (tension, fatigue). Your emotionally intelligent leadership approach should:',
      scenario: 'Leadership and team management',
      options: [
        'Maintain current expectations since performance is strong',
        'Reduce workload immediately to prevent burnout',
        'Explore stress sources collaboratively and adjust support systems',
        'Provide stress management resources and monitor outcomes'
      ],
      correctAnswer: 2,
      explanation: 'Collaborative exploration addresses both performance sustainability and employee wellbeing while maintaining professional development.',
      evidenceBased: 'Transformational leadership and emotional intelligence research'
    }
  ];

  const startGame = () => {
    setGameStarted(true);
    setGameComplete(false);
    setResults([]);
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
    setSelectedAnswer(null);
    setQuestionStartTime(performance.now());
  };

  const handleAnswer = useCallback((answerIndex: number) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections
    
    const currentQuestion = questions[currentQuestionIndex];
    const reactionTime = performance.now() - questionStartTime;
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    setSelectedAnswer(answerIndex);
    
    const result: QuestionResult = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      reactionTime,
      category: currentQuestion.category,
      type: currentQuestion.type
    };
    
    setResults(prev => [...prev, result]);
    setShowExplanation(true);
    
    // Auto-advance after showing explanation
    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex >= questions.length) {
        setGameComplete(true);
        setGameStarted(false);
      } else {
        setCurrentQuestionIndex(nextIndex);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setQuestionStartTime(performance.now());
      }
    }, 4000);
  }, [selectedAnswer, currentQuestionIndex, questionStartTime]);

  // Calculate comprehensive statistics
  const correctAnswers = results.filter(r => r.isCorrect).length;
  const accuracy = results.length > 0 ? Math.round((correctAnswers / results.length) * 100) : 0;
  const averageReactionTime = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.reactionTime, 0) / results.length)
    : 0;

  const categoryStats = ['basic', 'complex', 'social', 'situational', 'professional', 'interpersonal'].map(category => {
    const categoryResults = results.filter(r => r.category === category);
    const correct = categoryResults.filter(r => r.isCorrect).length;
    return {
      category,
      accuracy: categoryResults.length > 0 ? Math.round((correct / categoryResults.length) * 100) : 0,
      total: categoryResults.length
    };
  });

  const competencyStats = ['recognition', 'understanding', 'management', 'application'].map(competency => {
    const competencyResults = results.filter(r => {
      const question = questions.find(q => q.id === r.questionId);
      return question?.competency === competency;
    });
    const correct = competencyResults.filter(r => r.isCorrect).length;
    return {
      competency,
      accuracy: competencyResults.length > 0 ? Math.round((correct / competencyResults.length) * 100) : 0,
      total: competencyResults.length
    };
  });

  const difficultyStats = ['beginner', 'intermediate', 'advanced', 'expert'].map(difficulty => {
    const difficultyResults = results.filter(r => {
      const question = questions.find(q => q.id === r.questionId);
      return question?.difficulty === difficulty;
    });
    const correct = difficultyResults.filter(r => r.isCorrect).length;
    return {
      difficulty,
      accuracy: difficultyResults.length > 0 ? Math.round((correct / difficultyResults.length) * 100) : 0,
      total: difficultyResults.length
    };
  });

  const getEmotionalIntelligenceProfile = () => {
    const recognitionScore = (competencyStats.find(s => s.competency === 'recognition')?.accuracy || 0);
    const understandingScore = (competencyStats.find(s => s.competency === 'understanding')?.accuracy || 0);
    const managementScore = (competencyStats.find(s => s.competency === 'management')?.accuracy || 0);
    const applicationScore = (competencyStats.find(s => s.competency === 'application')?.accuracy || 0);
    
    const overallEI = Math.round((recognitionScore + understandingScore + managementScore + applicationScore) / 4);
    
    let level, color, description, recommendations;
    
    if (overallEI >= 90) {
      level = 'Expert'; color = 'text-purple-600';
      description = 'Exceptional emotional intelligence with mastery across all competencies';
      recommendations = ['Consider mentoring others in emotional intelligence', 'Apply skills in leadership roles', 'Explore advanced EI research'];
    } else if (overallEI >= 80) {
      level = 'Advanced'; color = 'text-green-600';
      description = 'Strong emotional intelligence with well-developed skills';
      recommendations = ['Practice advanced emotion regulation techniques', 'Focus on interpersonal application', 'Develop coaching abilities'];
    } else if (overallEI >= 70) {
      level = 'Proficient'; color = 'text-blue-600';
      description = 'Good emotional intelligence foundation with room for growth';
      recommendations = ['Practice micro-expression recognition', 'Work on emotional regulation strategies', 'Enhance empathetic responses'];
    } else if (overallEI >= 60) {
      level = 'Developing'; color = 'text-orange-600';
      description = 'Growing emotional awareness with significant potential';
      recommendations = ['Study facial expression basics', 'Practice mindful emotion awareness', 'Seek feedback on social interactions'];
    } else {
      level = 'Emerging'; color = 'text-red-600';
      description = 'Early stage emotional intelligence development';
      recommendations = ['Begin with basic emotion recognition', 'Practice daily emotional check-ins', 'Consider EI training programs'];
    }
    
    return { 
      level, color, description, recommendations, overallEI,
      recognitionScore, understandingScore, managementScore, applicationScore
    };
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameComplete(false);
    setResults([]);
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
    setSelectedAnswer(null);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const eiProfile = getEmotionalIntelligenceProfile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-violet-50 p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games" className="text-blue-600 hover:text-blue-800">
              ← Back to Games
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl">😊</span>
              <Badge variant="secondary">Emotion Recognition</Badge>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Professional Emotional Intelligence Assessment
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Evidence-based evaluation of emotional recognition, understanding, management, and application skills
          </p>
        </CardHeader>

        <CardContent>
          {!gameStarted && !gameComplete && (
            <div className="text-center space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-blue-900">Professional EI Assessment</h3>
                <div className="text-left space-y-3 text-blue-800">
                  <p>• Evidence-based questions using FACS (Facial Action Coding System)</p>
                  <p>• Multi-competency evaluation: Recognition, Understanding, Management, Application</p>
                  <p>• Professional scenarios for workplace emotional intelligence</p>
                  <p>• Difficulty progression from beginner to expert level</p>
                  <p>• Comprehensive performance analysis with development recommendations</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-2xl mb-2">�</div>
                  <div className="text-sm font-medium">Evidence-Based</div>
                  <div className="text-xs text-gray-500">FACS & Research</div>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-2xl mb-2">🧠</div>
                  <div className="text-sm font-medium">Micro-Expressions</div>
                  <div className="text-xs text-gray-500">Expert Recognition</div>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-2xl mb-2">�</div>
                  <div className="text-sm font-medium">Professional</div>
                  <div className="text-xs text-gray-500">Workplace Focus</div>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm font-medium">Comprehensive</div>
                  <div className="text-xs text-gray-500">Full EI Profile</div>
                </div>
              </div>
              
              <Button 
                onClick={startGame}
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white px-8 py-3"
              >
                Begin Professional EI Assessment
              </Button>
              
              <div className="text-sm text-gray-500 max-w-2xl mx-auto">
                <p className="mb-2">
                  <strong>Assessment Duration:</strong> Approximately 15-20 minutes
                </p>
                <p>
                  <strong>Based on:</strong> Ekman & Friesen research, Daniel Goleman's EI framework, 
                  and current organizational psychology standards
                </p>
              </div>
            </div>
          )}

          {gameStarted && !showExplanation && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
                <Badge variant="outline">
                  {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)}
                </Badge>
              </div>
              
              <Progress 
                value={(currentQuestionIndex / questions.length) * 100} 
                className="w-full"
              />

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="text-xs">
                      {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)} Level
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {currentQuestion.competency.charAt(0).toUpperCase() + currentQuestion.competency.slice(1)}
                    </Badge>
                  </div>
                  
                  {currentQuestion.emotionImage && (
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-2">{currentQuestion.emotionImage}</div>
                    </div>
                  )}
                  
                  {currentQuestion.scenario && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                      <span className="text-amber-800 font-medium">Professional Scenario: </span>
                      <span className="text-amber-700">{currentQuestion.scenario}</span>
                    </div>
                  )}
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    {currentQuestion.question}
                  </h3>
                  
                  <div className="grid gap-3">
                    {currentQuestion.options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="text-left h-auto p-4 hover:bg-blue-50 transition-colors whitespace-normal"
                        onClick={() => handleAnswer(index)}
                        disabled={selectedAnswer !== null}
                      >
                        <span className="font-medium mr-3 text-blue-600 flex-shrink-0">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className="text-sm">{option}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {showExplanation && (
            <div className="space-y-6">
              <div className="text-center">
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <div className="text-green-600">
                    <div className="text-4xl mb-2">✅</div>
                    <div className="text-xl font-semibold">Correct!</div>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <div className="text-4xl mb-2">❌</div>
                    <div className="text-xl font-semibold">Incorrect</div>
                    <div className="text-sm mt-1">
                      Correct answer: {String.fromCharCode(65 + currentQuestion.correctAnswer)}
                    </div>
                  </div>
                )}
              </div>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-green-900 mb-3">💡 Evidence-Based Explanation</h4>
                  <p className="text-green-800 mb-3">{currentQuestion.explanation}</p>
                  {currentQuestion.evidenceBased && (
                    <div className="text-sm text-green-700 bg-green-100 rounded-md p-2">
                      <strong>Research Foundation:</strong> {currentQuestion.evidenceBased}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="text-center text-gray-600">
                {currentQuestionIndex + 1 < questions.length ? (
                  <p>Next question in 4 seconds...</p>
                ) : (
                  <p>Calculating your results...</p>
                )}
              </div>
            </div>
          )}

          {gameComplete && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Emotional Intelligence Assessment Complete!
                </h3>
              </div>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className={`text-3xl font-bold ${eiProfile.color} mb-2`}>
                      {eiProfile.level}
                    </div>
                    <p className="text-gray-700 mb-4">{eiProfile.description}</p>
                    <div className="text-lg font-semibold text-gray-800">
                      Overall EI Score: {eiProfile.overallEI}%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {accuracy}%
                      </div>
                      <div className="text-gray-600">Overall Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {Math.round(averageReactionTime / 1000)}s
                      </div>
                      <div className="text-gray-600">Avg. Response Time</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">EI Competency Breakdown</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Recognition</span>
                        <div className="flex items-center gap-2">
                          <Progress value={eiProfile.recognitionScore} className="w-16" />
                          <span className="text-sm font-medium w-12">{eiProfile.recognitionScore}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Understanding</span>
                        <div className="flex items-center gap-2">
                          <Progress value={eiProfile.understandingScore} className="w-16" />
                          <span className="text-sm font-medium w-12">{eiProfile.understandingScore}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Management</span>
                        <div className="flex items-center gap-2">
                          <Progress value={eiProfile.managementScore} className="w-16" />
                          <span className="text-sm font-medium w-12">{eiProfile.managementScore}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Application</span>
                        <div className="flex items-center gap-2">
                          <Progress value={eiProfile.applicationScore} className="w-16" />
                          <span className="text-sm font-medium w-12">{eiProfile.applicationScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <h4 className="font-semibold text-gray-900">Category Performance</h4>
                    {categoryStats.filter(stat => stat.total > 0).map(stat => (
                      <div key={stat.category} className="flex justify-between items-center">
                        <span className="capitalize text-gray-700">{stat.category} Emotions</span>
                        <div className="flex items-center gap-2">
                          <Progress value={stat.accuracy} className="w-20" />
                          <span className="text-sm font-medium w-12">{stat.accuracy}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">🎓 Professional Development Recommendations</h4>
                  <div className="space-y-2 text-blue-800">
                    {eiProfile.recommendations.map((rec, index) => (
                      <p key={index}>• {rec}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-green-900 mb-3">📊 Performance Insights</h4>
                  <div className="space-y-2 text-green-800">
                    {difficultyStats.map(stat => {
                      if (stat.total > 0 && stat.accuracy >= 75) {
                        return (
                          <p key={stat.difficulty}>
                            • Strong performance on {stat.difficulty} level questions ({stat.accuracy}%)
                          </p>
                        );
                      }
                      return null;
                    })}
                    {competencyStats.map(stat => {
                      if (stat.total > 0 && stat.accuracy >= 80) {
                        return (
                          <p key={stat.competency}>
                            • Excellent {stat.competency} competency ({stat.accuracy}%)
                          </p>
                        );
                      }
                      return null;
                    })}
                    {averageReactionTime < 8000 && (
                      <p>• Quick emotional processing and decision-making</p>
                    )}
                    {accuracy >= 85 && (
                      <p>• Demonstrates high emotional intelligence across multiple domains</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={resetGame}
                  className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white"
                >
                  Take Test Again
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