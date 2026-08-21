package models

import "time"

type FoundationalStatement struct {
	ID              string            `json:"id"`
	Title           string            `json:"title"`
	Author          string            `json:"author"`
	Statement       string            `json:"statement"`
	Archetypes      []string          `json:"archetypes"`
	Correspondences map[string]string `json:"correspondences"`
	CreatedAt       time.Time         `json:"created_at"`
	SourceFile      string            `json:"source_file"`
}

type ContextNode struct {
	Key             string            `json:"key"`
	Category        string            `json:"category"`
	Title           string            `json:"title"`
	Summary         string            `json:"summary"`
	Content         string            `json:"content"`
	Tags            []string          `json:"tags"`
	RelativeKeys    []string          `json:"relative_keys"`
	RelativeContext []ContextRelation `json:"relative_context,omitempty"`
	Metadata        map[string]string `json:"metadata,omitempty"`
	UpdatedAt       time.Time         `json:"updated_at"`
}

type ContextRelation struct {
	Key          string `json:"key"`
	Title        string `json:"title"`
	Category     string `json:"category"`
	RelationType string `json:"relation_type"`
}

type DashaSubPeriod struct {
	SubLord        string  `json:"sub_lord"`
	DurationYears  float64 `json:"duration_years"`
	DurationMonths int     `json:"duration_months"`
	DurationDays   int     `json:"duration_days"`
	Qualities      string  `json:"qualities"`
	Psychological  string  `json:"psychological"`
	Material       string  `json:"material"`
	Esoteric       string  `json:"esoteric"`
	Talismanic     string  `json:"talismanic"`
}

type DashaOverview struct {
	MahadashaLord    string           `json:"mahadasha_lord"`
	TotalYears       int              `json:"total_years"`
	VimshottariOrder int              `json:"vimshottari_order"`
	SeedDeity        string           `json:"seed_deity"`
	Gemstone         string           `json:"gemstone"`
	Mantra           string           `json:"mantra"`
	Description      string           `json:"description"`
	SubPeriods       []DashaSubPeriod `json:"sub_periods"`
}

type Nakshatra struct {
	Name            string   `json:"name"`
	Sanskrit        string   `json:"sanskrit"`
	ZodiacSpan      string   `json:"zodiac_span"`
	Symbol          string   `json:"symbol"`
	Deity           string   `json:"deity"`
	Shakti          string   `json:"shakti"`
	EsotericMeaning string   `json:"esoteric_meaning"`
	Qualities       []string `json:"qualities"`
}

type AlchemicalPrinciple struct {
	Principle   string   `json:"principle"`
	LatinName   string   `json:"latin_name"`
	Symbol      string   `json:"symbol"`
	Element     string   `json:"element"`
	Role        string   `json:"role"`
	Description string   `json:"description"`
	Properties  []string `json:"properties"`
}

type AuthorOpus struct {
	Author     string      `json:"author"`
	Bio        string      `json:"bio"`
	OpusTitle  string      `json:"opus_title"`
	Essays     []OpusEssay `json:"essays"`
	Chronology []LifeEvent `json:"chronology"`
}

type OpusEssay struct {
	Slug        string   `json:"slug"`
	Title       string   `json:"title"`
	Date        string   `json:"date"`
	Theme       string   `json:"theme"`
	Abstract    string   `json:"abstract"`
	Content     string   `json:"content"`
	KeyInsights []string `json:"key_insights"`
}

type LifeEvent struct {
	Period             string `json:"period"`
	Title              string `json:"title"`
	Cycle              string `json:"cycle"`
	Description        string `json:"description"`
	MercurialResonance string `json:"mercurial_resonance"`
}

type DashaTransition struct {
	ID                  string   `json:"id"`
	NativeName          string   `json:"native_name"`
	CurrentMahadasha    string   `json:"current_mahadasha"`
	CurrentAntardasha   string   `json:"current_antardasha"`
	CycleName           string   `json:"cycle_name"`
	TargetIngressDate   string   `json:"target_ingress_date"`
	DaysRemaining       int      `json:"days_remaining"`
	MonthsRemaining     float64  `json:"months_remaining"`
	Theme               string   `json:"theme"`
	SaturnineMastery    []string `json:"saturnine_mastery"`
	JupiterianSynthesis []string `json:"jupiterian_synthesis"`
	MercurialReadiness  []string `json:"mercurial_readiness"`
}
