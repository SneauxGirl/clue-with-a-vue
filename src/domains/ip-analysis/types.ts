export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface IPAnalysisResult {
  ip: string
  fraudScore: number
  riskLevel: RiskLevel
  isVPN: boolean
  isProxy: boolean
  isTor: boolean
  country: string
  abuseReportCount: number
  lastAbuseReportDate: string | null
  isInDatacenter: boolean
  asn: string
  organization: string
}

export class InvalidIPError extends Error {
  readonly input: string

  constructor(input: string) {
    super(`Invalid IP address. Format: 192.168.1.1`)
    this.name = 'InvalidIPError'
    this.input = input
  }
}

export class IPAnalysisFetchError extends Error {
  readonly ip: string

  constructor(ip: string) {
    super('Failed to fetch. Retry?')
    this.name = 'IPAnalysisFetchError'
    this.ip = ip
  }
}
