/**
 * AI Symptom Analysis Module
 */

import { getDB } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export interface AIAnalysisResponse {
  id: string
  symptoms: string[]
  riskLevel: 'low' | 'medium' | 'high'
  possibleConditions: Array<{
    name: string
    probability: number
  }>
  recommendations: string[]
  referralRequired: boolean
  confidence: number
  timestamp: string
}

export class AIAnalysisService {
  /**
   * Analyze symptoms (mocked for demo, can be replaced with actual API)
   */
  async analyzeSymptoms(symptoms: string[]): Promise<AIAnalysisResponse> {
    try {
      // Call actual API if production
      const response = await this.mockAnalyzeSymptoms(symptoms)

      // Cache result
      const db = await getDB()
      await db.put('aiAnalysis', response)

      return response
    } catch (error) {
      console.error('Analysis failed:', error)
      throw error
    }
  }

  /**
   * Mock analysis (replace with real API call in production)
   */
  private async mockAnalyzeSymptoms(symptoms: string[]): Promise<AIAnalysisResponse> {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Map symptoms to conditions and risk levels
    const symptomMap: Record<string, { conditions: string[]; riskLevel: 'low' | 'medium' | 'high' }> = {
      'chest pain': {
        conditions: ['Angina', 'Heart Disease', 'Pulmonary Embolism'],
        riskLevel: 'high',
      },
      fever: {
        conditions: ['Flu', 'Malaria', 'Typhoid', 'Common Cold'],
        riskLevel: 'medium',
      },
      cough: {
        conditions: ['Bronchitis', 'Pneumonia', 'Asthma', 'Tuberculosis'],
        riskLevel: 'medium',
      },
      'severe dehydration': {
        conditions: ['Diarrhea', 'Cholera', 'Heat Stroke'],
        riskLevel: 'high',
      },
      headache: {
        conditions: ['Migraine', 'Meningitis', 'Tension Headache', 'Sinusitis'],
        riskLevel: 'low',
      },
      'shortness of breath': {
        conditions: ['Asthma', 'Pneumonia', 'Heart Disease'],
        riskLevel: 'high',
      },
    }

    let overallRiskLevel: 'low' | 'medium' | 'high' = 'low'
    let allConditions: string[] = []
    let shouldRefer = false

    // Check for high-risk conditions
    const lowerSymptoms = symptoms.map((s) => s.toLowerCase())

    for (const [symptomKey, data] of Object.entries(symptomMap)) {
      if (lowerSymptoms.some((s) => s.includes(symptomKey.toLowerCase()))) {
        allConditions.push(...data.conditions)
        if (data.riskLevel === 'high') {
          overallRiskLevel = 'high'
          shouldRefer = true
        } else if (data.riskLevel === 'medium' && overallRiskLevel !== 'high') {
          overallRiskLevel = 'medium'
        }
      }
    }

    // Default to low risk if no conditions found
    if (allConditions.length === 0) {
      allConditions = ['General Viral Infection', 'Common Cold']
      overallRiskLevel = 'low'
    }

    // Remove duplicates
    allConditions = Array.from(new Set(allConditions))

    const recommendations = this.getRecommendations(overallRiskLevel, allConditions)
    const confidence = 70 + Math.random() * 25 // 70-95%

    return {
      id: uuidv4(),
      symptoms,
      riskLevel: overallRiskLevel,
      possibleConditions: allConditions.map((condition, index) => ({
        name: condition,
        probability: Math.max(50, 95 - index * 10),
      })),
      recommendations,
      referralRequired: shouldRefer,
      confidence: Math.round(confidence),
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Get recommendations based on analysis
   */
  private getRecommendations(riskLevel: string, conditions: string[]): string[] {
    const baseRecommendations = [
      'Monitor vital signs regularly',
      'Stay hydrated',
      'Get adequate rest',
      'Consult local health worker for examination',
    ]

    if (riskLevel === 'high') {
      return [
        '⚠️ URGENT - Refer to nearest health facility',
        'Contact PHC immediately',
        ...baseRecommendations,
      ]
    }

    if (riskLevel === 'medium') {
      return [
        'Follow up in 2-3 days',
        'Monitor for worsening symptoms',
        ...baseRecommendations,
      ]
    }

    return ['Continue home care', ...baseRecommendations]
  }

  /**
   * Get cached analysis
   */
  async getCachedAnalysis(id: string): Promise<AIAnalysisResponse | null> {
    try {
      const db = await getDB()
      return (await db.get<AIAnalysisResponse>('aiAnalysis', id)) ?? null
    } catch (error) {
      console.error('Failed to get cached analysis:', error)
      return null
    }
  }

  /**
   * Clear analysis cache
   */
  async clearCache(): Promise<void> {
    try {
      const db = await getDB()
      await db.clear('aiAnalysis')
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }
}

// Singleton instance
let aiServiceInstance: AIAnalysisService | null = null

export function getAIAnalysisService(): AIAnalysisService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIAnalysisService()
  }
  return aiServiceInstance
}
