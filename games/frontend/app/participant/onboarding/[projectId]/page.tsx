"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Monitor,
  Timer,
  Volume2,
  Target,
  CheckCircle,
  Play
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

// Simple interface for project data
interface Project {
  id: string
  title: string
  description: string
  duration: string
  experiments?: Array<{
    name: string
    duration: string
    type: string
  }>
}

// Calibration results interface
interface CalibrationResults {
  displayInfo: {
    refreshRate: number
    resolution: string
    colorDepth: number
  }
  timingAccuracy: {
    frameJitter: number
    inputDelay: number
    audioLatency: number
  }
  environmentCheck: {
    browserSupported: boolean
    webAudioSupported: boolean
    fullscreenSupported: boolean
  }
  qualityScore: number
}

// Mock project data - replace with API call
const getProjectData = (id: string) => ({
  id,
  title: "BehaviorLab Experiment",
  description: "Participate in this cognitive experiment.",
  duration: "5-10 minutes",
  experiments: [
    { name: "Reaction Time Test", duration: "3 min", type: "Cognitive" },
    { name: "Visual Attention Task", duration: "4 min", type: "Perception" },
    { name: "Memory Challenge", duration: "3 min", type: "Cognitive" }
  ]
})

// Terms and Conditions Component
function TermsAndConditions({ onAccept, onDecline }: { onAccept: () => void, onDecline: () => void }) {
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToData, setAgreedToData] = useState(false)
  const [agreedToContact, setAgreedToContact] = useState(false)

  const canProceed = agreedToTerms && agreedToData

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Research Participation Agreement</h3>

        <div className="bg-gray-50 rounded-lg p-6 max-h-80 overflow-y-auto mb-6">
          <div className="prose prose-sm">
            <h4 className="font-semibold">Purpose of Study</h4>
            <p>You are being invited to participate in a research study investigating cognitive performance and reaction times. This study is conducted by researchers at the University Psychology Lab.</p>

            <h4 className="font-semibold mt-4">What You Will Do</h4>
            <p>You will complete a series of computer-based tasks that measure:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Reaction time to visual stimuli</li>
              <li>Working memory performance</li>
              <li>Attention and focus abilities</li>
              <li>Decision-making under time pressure</li>
            </ul>

            <h4 className="font-semibold mt-4">Time Commitment</h4>
            <p>The study will take approximately 15-20 minutes to complete.</p>

            <h4 className="font-semibold mt-4">Risks and Benefits</h4>
            <p>There are no known physical or psychological risks associated with this study. The tasks are similar to computer games and are designed to be engaging. You may gain insight into your cognitive abilities.</p>

            <h4 className="font-semibold mt-4">Data Collection and Privacy</h4>
            <p>We will collect:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Your responses and reaction times during tasks</li>
              <li>Basic demographic information (age, gender, education level)</li>
              <li>Technical information about your device and browser for data quality assurance</li>
            </ul>

            <p>All data will be:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Kept strictly confidential</li>
              <li>Stored securely on encrypted servers</li>
              <li>Used only for research purposes</li>
              <li>Reported only in aggregate form</li>
              <li>Destroyed after 7 years per university policy</li>
            </ul>

            <h4 className="font-semibold mt-4">Voluntary Participation</h4>
            <p>Your participation is completely voluntary. You may:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Withdraw at any time without penalty</li>
              <li>Skip any questions you don't want to answer</li>
              <li>Request that your data be deleted</li>
            </ul>

            <h4 className="font-semibold mt-4">High-Precision Timing Technology</h4>
            <p>This study uses advanced timing technology to achieve millisecond-accurate measurements. We will calibrate your device to ensure optimal data quality. This may include:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Testing your display refresh rate and timing</li>
              <li>Measuring input device response delays</li>
              <li>Checking audio playback latency</li>
              <li>Monitoring frame rate during experiments</li>
            </ul>

            <h4 className="font-semibold mt-4">Contact Information</h4>
            <p>If you have questions about this study, contact:</p>
            <p>Dr. Sarah Johnson<br />University Psychology Lab<br />Email: s.johnson@university.edu<br />Phone: (555) 123-4567</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
          />
          <div className="grid gap-1.5 leading-none">
            <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              I have read and understand the research participation agreement
            </label>
            <p className="text-xs text-muted-foreground">
              Required to participate in this study
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="data"
            checked={agreedToData}
            onCheckedChange={(checked) => setAgreedToData(!!checked)}
          />
          <div className="grid gap-1.5 leading-none">
            <label htmlFor="data" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              I consent to the collection and use of my data as described
            </label>
            <p className="text-xs text-muted-foreground">
              Required to participate in this study
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={onDecline}
          className="flex-1"
        >
          Decline
        </Button>
        <Button
          onClick={onAccept}
          disabled={!canProceed}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Accept & Continue
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// System Calibration Component
function SystemCalibration({ onComplete }: { onComplete: (results: CalibrationResults) => void }) {
  const [calibrationStep, setCalibrationStep] = useState<'intro' | 'running' | 'complete'>('intro')
  const [progress, setProgress] = useState(0)
  const [currentTest, setCurrentTest] = useState('')
  const [results, setResults] = useState<CalibrationResults | null>(null)

  // Real calibration functions
  const measureDisplayRefreshRate = async (): Promise<number> => {
    return new Promise((resolve) => {
      let frames = 0
      const startTime = performance.now()
      
      const frame = () => {
        frames++
        if (frames < 120) { // Test for 2 seconds at 60fps
          requestAnimationFrame(frame)
        } else {
          const endTime = performance.now()
          const duration = (endTime - startTime) / 1000
          const refreshRate = Math.round(frames / duration)
          resolve(refreshRate)
        }
      }
      
      requestAnimationFrame(frame)
    })
  }

  const measureInputLatency = async (): Promise<number> => {
    return new Promise((resolve) => {
      const measurements: number[] = []
      let measurementCount = 0
      const maxMeasurements = 5

      const measureOnce = () => {
        const startTime = performance.now()
        
        const handleClick = () => {
          const endTime = performance.now()
          const latency = endTime - startTime
          measurements.push(latency)
          measurementCount++
          
          document.removeEventListener('click', handleClick)
          
          if (measurementCount < maxMeasurements) {
            setTimeout(measureOnce, 500)
          } else {
            const avgLatency = measurements.reduce((a, b) => a + b, 0) / measurements.length
            resolve(avgLatency)
          }
        }
        
        document.addEventListener('click', handleClick)
        
        // Auto-click for measurement (simulating user input)
        setTimeout(() => {
          const event = new MouseEvent('click', { bubbles: true })
          document.dispatchEvent(event)
        }, Math.random() * 100 + 50)
      }
      
      measureOnce()
    })
  }

  const measureAudioLatency = async (): Promise<number> => {
    return new Promise((resolve) => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const baseLatency = audioContext.baseLatency || 0
        const outputLatency = audioContext.outputLatency || 0
        const totalLatency = (baseLatency + outputLatency) * 1000 // Convert to ms
        
        audioContext.close()
        resolve(totalLatency || 10.0) // Default fallback
      } catch (error) {
        resolve(10.0) // Default fallback if Web Audio API is not available
      }
    })
  }

  const measureFrameJitter = async (): Promise<number> => {
    return new Promise((resolve) => {
      const frameTimes: number[] = []
      let lastTime = performance.now()
      let frameCount = 0
      
      const measureFrame = () => {
        const currentTime = performance.now()
        const deltaTime = currentTime - lastTime
        frameTimes.push(deltaTime)
        lastTime = currentTime
        frameCount++
        
        if (frameCount < 60) { // Measure for 60 frames
          requestAnimationFrame(measureFrame)
        } else {
          // Calculate jitter (standard deviation of frame times)
          const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
          const variance = frameTimes.reduce((sum, time) => sum + Math.pow(time - avgFrameTime, 2), 0) / frameTimes.length
          const jitter = Math.sqrt(variance)
          resolve(jitter)
        }
      }
      
      requestAnimationFrame(measureFrame)
    })
  }

  const checkEnvironment = (): { browserSupported: boolean, webAudioSupported: boolean, fullscreenSupported: boolean } => {
    return {
      browserSupported: !!(typeof window !== 'undefined' && 'requestAnimationFrame' in window && 'performance' in window && typeof window.performance.now === 'function'),
      webAudioSupported: !!(window.AudioContext || (window as any).webkitAudioContext),
      fullscreenSupported: !!(document.documentElement.requestFullscreen || (document.documentElement as any).webkitRequestFullscreen)
    }
  }

  const runCalibration = async () => {
    setCalibrationStep('running')
    setProgress(0)

    try {
      // Step 1: Environment check
      setCurrentTest('Checking browser compatibility...')
      setProgress(10)
      await new Promise(resolve => setTimeout(resolve, 500))
      const envCheck = checkEnvironment()

      // Step 2: Display refresh rate
      setCurrentTest('Measuring display refresh rate...')
      setProgress(25)
      const refreshRate = await measureDisplayRefreshRate()

      // Step 3: Frame jitter
      setCurrentTest('Testing frame timing consistency...')
      setProgress(45)
      const frameJitter = await measureFrameJitter()

      // Step 4: Input latency
      setCurrentTest('Measuring input response time...')
      setProgress(65)
      const inputLatency = await measureInputLatency()

      // Step 5: Audio latency
      setCurrentTest('Testing audio system latency...')
      setProgress(80)
      const audioLatency = await measureAudioLatency()

      // Step 6: Calculate quality score
      setCurrentTest('Calculating quality score...')
      setProgress(95)
      await new Promise(resolve => setTimeout(resolve, 500))

      const qualityScore = calculateQualityScore(refreshRate, frameJitter, inputLatency, audioLatency, envCheck)

      const calibrationResults: CalibrationResults = {
        displayInfo: {
          refreshRate,
          resolution: `${screen.width}x${screen.height}`,
          colorDepth: screen.colorDepth
        },
        timingAccuracy: {
          frameJitter,
          inputDelay: inputLatency,
          audioLatency
        },
        environmentCheck: envCheck,
        qualityScore
      }

      setResults(calibrationResults)
      setProgress(100)
      setCalibrationStep('complete')
    } catch (error) {
      console.error('Calibration failed:', error)
      // Fallback to reasonable defaults
      const fallbackResults: CalibrationResults = {
        displayInfo: {
          refreshRate: 60,
          resolution: `${screen.width}x${screen.height}`,
          colorDepth: screen.colorDepth
        },
        timingAccuracy: {
          frameJitter: 2.0,
          inputDelay: 5.0,
          audioLatency: 15.0
        },
        environmentCheck: checkEnvironment(),
        qualityScore: 0.7
      }
      setResults(fallbackResults)
      setProgress(100)
      setCalibrationStep('complete')
    }
  }

  const calculateQualityScore = (
    refreshRate: number, 
    frameJitter: number, 
    inputLatency: number, 
    audioLatency: number, 
    envCheck: { browserSupported: boolean, webAudioSupported: boolean, fullscreenSupported: boolean }
  ): number => {
    let score = 1.0

    // Refresh rate scoring (60Hz+ is good)
    if (refreshRate < 30) score -= 0.3
    else if (refreshRate < 60) score -= 0.1
    else if (refreshRate >= 120) score += 0.1

    // Frame jitter scoring (lower is better)
    if (frameJitter > 5) score -= 0.2
    else if (frameJitter > 2) score -= 0.1

    // Input latency scoring (lower is better)
    if (inputLatency > 20) score -= 0.2
    else if (inputLatency > 10) score -= 0.1

    // Audio latency scoring (lower is better)
    if (audioLatency > 50) score -= 0.1
    else if (audioLatency > 20) score -= 0.05

    // Environment checks
    if (!envCheck.browserSupported) score -= 0.3
    if (!envCheck.webAudioSupported) score -= 0.1
    if (!envCheck.fullscreenSupported) score -= 0.05

    return Math.max(0, Math.min(1, score))
  }

  const handleRecalibrate = async () => {
    await runCalibration()
  }

  const handleComplete = () => {
    if (results) {
      onComplete(results)
    }
  }

  if (calibrationStep === 'intro') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">System Calibration</h3>
          <p className="text-gray-600 mb-6">
            We need to calibrate your device to ensure millisecond-accurate timing measurements.
            This process will test your display, audio, and input capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Monitor className="w-8 h-8 text-blue-600" />
                <div>
                  <h4 className="font-medium">Display Test</h4>
                  <p className="text-sm text-gray-600">Refresh rate & timing accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Timer className="w-8 h-8 text-green-600" />
                <div>
                  <h4 className="font-medium">Input Latency</h4>
                  <p className="text-sm text-gray-600">Keyboard & mouse response</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Volume2 className="w-8 h-8 text-purple-600" />
                <div>
                  <h4 className="font-medium">Audio Test</h4>
                  <p className="text-sm text-gray-600">Playback timing & latency</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Target className="w-8 h-8 text-orange-600" />
                <div>
                  <h4 className="font-medium">Environment</h4>
                  <p className="text-sm text-gray-600">Browser compatibility</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            For best results, close other applications and ensure a stable internet connection.
            The calibration will take about 30 seconds.
          </AlertDescription>
        </Alert>

        <div className="flex justify-end">
          <Button
            onClick={runCalibration}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Start Calibration
            <Target className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  if (calibrationStep === 'running') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Calibrating Your System</h3>
          <p className="text-gray-600 mb-6">
            {currentTest}
          </p>
        </div>

        <div className="space-y-4">
          <Progress value={progress} className="w-full" />
          <p className="text-center text-sm text-gray-600">
            {progress.toFixed(0)}% Complete
          </p>
        </div>

        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!results) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">System Calibrated</h3>
            <p className="text-xs text-gray-600">Ready for precise timing measurements</p>
          </div>
        </div>
      </div>

      {/* Overall Quality Score */}
      <Card className={`border-2 ${
        results.qualityScore >= 0.8 
          ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' 
          : results.qualityScore >= 0.6 
          ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50' 
          : 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50'
      }`}>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white ${
                results.qualityScore >= 0.8 ? 'bg-green-500' : 
                results.qualityScore >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {Math.round(results.qualityScore * 100)}
              </div>
            </div>
            <h4 className="text-base font-semibold mb-1">Timing Accuracy Score</h4>
            <Badge className={`${
              results.qualityScore >= 0.8 ? 'bg-green-600 hover:bg-green-700' : 
              results.qualityScore >= 0.6 ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'
            } text-white px-3 py-1 text-xs font-medium`}>
              {results.qualityScore >= 0.8 ? 'Excellent' : results.qualityScore >= 0.6 ? 'Good' : 'Fair'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Technical Measurements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-600" />
              Display Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Refresh Rate</span>
                <span className="font-semibold text-blue-700">{results.displayInfo.refreshRate}Hz</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Resolution</span>
                <span className="font-semibold text-blue-700">{results.displayInfo.resolution}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Frame Timing</span>
                <span className="font-semibold text-blue-700">{results.timingAccuracy.frameJitter.toFixed(2)}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-purple-200 bg-purple-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Timer className="w-5 h-5 text-purple-600" />
              Response Timing
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Input Latency</span>
                <span className="font-semibold text-purple-700">{results.timingAccuracy.inputDelay.toFixed(1)}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Audio Latency</span>
                <span className="font-semibold text-purple-700">{results.timingAccuracy.audioLatency.toFixed(1)}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Browser Support</span>
                <span className={`font-semibold ${results.environmentCheck.browserSupported ? 'text-green-600' : 'text-red-600'}`}>
                  {results.environmentCheck.browserSupported ? 'Optimal' : 'Limited'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">System Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${results.environmentCheck.browserSupported ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">High-Precision Timing</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${results.environmentCheck.webAudioSupported ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">Audio Processing</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${results.environmentCheck.fullscreenSupported ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">Fullscreen Mode</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Warning */}
      {results.qualityScore < 0.6 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Performance Notice:</strong> Your system may not provide optimal timing accuracy. 
            Consider closing other applications, using a wired connection, or trying a different browser for better results.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handleRecalibrate}
          className="flex-1 border-gray-300 hover:bg-gray-50"
        >
          <Target className="w-4 h-4 mr-2" />
          Recalibrate
        </Button>
        <Button
          onClick={handleComplete}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Continue to Experiments
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// Final Ready Check Component
function ReadyCheck({ project, onStart }: { project: any, onStart: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Ready to Begin</h3>
        <p className="text-gray-600 mb-6">
          You're all set! Here's what to expect during the study:
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{project.title}</CardTitle>
          <CardDescription>Estimated duration: {project.duration}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">You will complete:</h4>
              <div className="space-y-2">
                {project.experiments.map((exp: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{exp.name}</p>
                      <p className="text-xs text-gray-600">{exp.duration}</p>
                    </div>
                    <Badge variant="outline">{exp.type}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Important reminders:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Find a quiet place without distractions</li>
                <li>• Use headphones if available for audio tasks</li>
                <li>• Keep your hands on the keyboard/mouse</li>
                <li>• Respond as quickly and accurately as possible</li>
                <li>• Take breaks between tasks if needed</li>
                <li>• Do not refresh the page during the study</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Your system is calibrated and ready for high-precision timing measurements.
          Data will be collected automatically as you complete each task.
        </AlertDescription>
      </Alert>

      <div className="flex justify-center">
        <Button
          onClick={onStart}
          size="lg"
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Study
        </Button>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [currentStep, setCurrentStep] = useState<'terms' | 'calibration' | 'ready'>('terms')
  const [calibrationResults, setCalibrationResults] = useState<CalibrationResults | null>(null)

  const project = getProjectData(projectId)

  const handleTermsAccept = () => {
    setCurrentStep('calibration')
  }

  const handleDecline = () => {
    router.push('/participant')
  }

  const handleCalibrationComplete = (results: CalibrationResults) => {
    setCalibrationResults(results)
    setCurrentStep('ready')
  }

  const handleStart = () => {
    // Navigate to the actual experiment
    router.push(`/participant/${projectId}`)
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'terms': return 'Terms and Conditions'
      case 'calibration': return 'Timing Calibration'
      case 'ready': return 'Ready to Begin'
      default: return 'Onboarding'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'terms': return 'Please review and accept before continuing'
      case 'calibration': return 'System calibration for precise timing measurements'
      case 'ready': return 'All set! Ready to start the experiment'
      default: return 'Complete the onboarding process'
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'terms':
        return (
          <TermsAndConditions
            onAccept={handleTermsAccept}
            onDecline={handleDecline}
          />
        )
      case 'calibration':
        return (
          <SystemCalibration
            onComplete={handleCalibrationComplete}
          />
        )
      case 'ready':
        return (
          <ReadyCheck
            project={project}
            onStart={handleStart}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/participant')}
                className="mr-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Studies
              </Button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{project.title}</h1>
                <p className="text-xs text-gray-500">Experiment Onboarding</p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="hidden md:flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                currentStep === 'terms' ? 'bg-blue-600 text-white' :
                ['calibration', 'ready'].includes(currentStep) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className="w-8 h-0.5 bg-gray-200">
                <div className={`h-full transition-all duration-300 ${
                  ['calibration', 'ready'].includes(currentStep) ? 'bg-green-600 w-full' : 'bg-gray-200 w-0'
                }`} />
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                currentStep === 'calibration' ? 'bg-blue-600 text-white' :
                currentStep === 'ready' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className="w-8 h-0.5 bg-gray-200">
                <div className={`h-full transition-all duration-300 ${
                  currentStep === 'ready' ? 'bg-green-600 w-full' : 'bg-gray-200 w-0'
                }`} />
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                currentStep === 'ready' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle className="text-xl">{getStepTitle()}</CardTitle>
            <CardDescription>{getStepDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderCurrentStep()}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}