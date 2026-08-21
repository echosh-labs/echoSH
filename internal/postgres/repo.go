package postgres

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"time"

	"mercury-dasha/internal/models"
)

type Repository struct {
	db *DB
}

func NewRepository(db *DB) *Repository {
	return &Repository{db: db}
}

// GetFoundationalStatement fetches the primary axiom from PostgreSQL
func (r *Repository) GetFoundationalStatement(ctx context.Context) (*models.FoundationalStatement, error) {
	if r.db == nil || !r.db.IsAlive() {
		return nil, fmt.Errorf("postgres unavailable")
	}

	query := `
	SELECT id, title, author, statement_text, archetypes, correspondences, created_at
	FROM foundational_axioms
	WHERE is_active = TRUE
	ORDER BY created_at DESC
	LIMIT 1;`

	var stmt models.FoundationalStatement
	var archetypesJSON, correspondencesJSON []byte

	err := r.db.Pool().QueryRowContext(ctx, query).Scan(
		&stmt.ID,
		&stmt.Title,
		&stmt.Author,
		&stmt.Statement,
		&archetypesJSON,
		&correspondencesJSON,
		&stmt.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	_ = json.Unmarshal(archetypesJSON, &stmt.Archetypes)
	_ = json.Unmarshal(correspondencesJSON, &stmt.Correspondences)
	stmt.SourceFile = "PostgreSQL: foundational_axioms table"

	return &stmt, nil
}

// GetDashaOverview fetches the 17-Year Mercury Mahadasha and its 9 Antardashas
func (r *Repository) GetDashaOverview(ctx context.Context) (*models.DashaOverview, error) {
	if r.db == nil || !r.db.IsAlive() {
		return nil, fmt.Errorf("postgres unavailable")
	}

	dashaQuery := `
	SELECT id, mahadasha_lord, total_years, vimshottari_order, seed_deity, gemstone, mantra, description
	FROM planetary_dashas
	WHERE mahadasha_lord = 'Mercury (Budha)'
	LIMIT 1;`

	var dasha models.DashaOverview
	var dashaID int
	err := r.db.Pool().QueryRowContext(ctx, dashaQuery).Scan(
		&dashaID,
		&dasha.MahadashaLord,
		&dasha.TotalYears,
		&dasha.VimshottariOrder,
		&dasha.SeedDeity,
		&dasha.Gemstone,
		&dasha.Mantra,
		&dasha.Description,
	)
	if err != nil {
		return nil, err
	}

	subQuery := `
	SELECT sub_lord, duration_years, duration_months, duration_days, qualities, psychological, material, esoteric, talismanic
	FROM dasha_sub_periods
	WHERE dasha_id = $1
	ORDER BY sort_order ASC;`

	rows, err := r.db.Pool().QueryContext(ctx, subQuery, dashaID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var sub models.DashaSubPeriod
		if err := rows.Scan(
			&sub.SubLord,
			&sub.DurationYears,
			&sub.DurationMonths,
			&sub.DurationDays,
			&sub.Qualities,
			&sub.Psychological,
			&sub.Material,
			&sub.Esoteric,
			&sub.Talismanic,
		); err != nil {
			return nil, err
		}
		dasha.SubPeriods = append(dasha.SubPeriods, sub)
	}

	return &dasha, nil
}

// GetNakshatras fetches the 3 Mercurial Lunar Mansions
func (r *Repository) GetNakshatras(ctx context.Context) ([]models.Nakshatra, error) {
	if r.db == nil || !r.db.IsAlive() {
		return nil, fmt.Errorf("postgres unavailable")
	}

	query := `
	SELECT name, sanskrit_name, zodiac_span, symbol, deity, shakti, esoteric_meaning, qualities
	FROM nakshatras
	ORDER BY id ASC;`

	rows, err := r.db.Pool().QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Nakshatra
	for rows.Next() {
		var nak models.Nakshatra
		var qualitiesJSON []byte
		if err := rows.Scan(
			&nak.Name,
			&nak.Sanskrit,
			&nak.ZodiacSpan,
			&nak.Symbol,
			&nak.Deity,
			&nak.Shakti,
			&nak.EsotericMeaning,
			&qualitiesJSON,
		); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(qualitiesJSON, &nak.Qualities)
		list = append(list, nak)
	}

	return list, nil
}

// GetAlchemicalPrinciples fetches Tria Prima & Hydrargyrum records
func (r *Repository) GetAlchemicalPrinciples(ctx context.Context) ([]models.AlchemicalPrinciple, error) {
	if r.db == nil || !r.db.IsAlive() {
		return nil, fmt.Errorf("postgres unavailable")
	}

	query := `
	SELECT principle, latin_name, symbol, element, role, description, properties
	FROM alchemical_principles
	ORDER BY sort_order ASC;`

	rows, err := r.db.Pool().QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.AlchemicalPrinciple
	for rows.Next() {
		var p models.AlchemicalPrinciple
		var propJSON []byte
		if err := rows.Scan(
			&p.Principle,
			&p.LatinName,
			&p.Symbol,
			&p.Element,
			&p.Role,
			&p.Description,
			&propJSON,
		); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(propJSON, &p.Properties)
		list = append(list, p)
	}

	return list, nil
}

// GetAuthorOpus fetches Justin Andrew Wood's bio, essays, and life milestones
func (r *Repository) GetAuthorOpus(ctx context.Context) (*models.AuthorOpus, error) {
	if r.db == nil || !r.db.IsAlive() {
		return nil, fmt.Errorf("postgres unavailable")
	}

	authorQuery := `
	SELECT id, author_name, bio, opus_title
	FROM author_profiles
	WHERE author_name = 'Justin Andrew Wood'
	LIMIT 1;`

	var opus models.AuthorOpus
	var authorID int
	err := r.db.Pool().QueryRowContext(ctx, authorQuery).Scan(
		&authorID,
		&opus.Author,
		&opus.Bio,
		&opus.OpusTitle,
	)
	if err != nil {
		return nil, err
	}

	// Essays
	essayQuery := `
	SELECT slug, title, essay_date, theme, abstract, content, key_insights
	FROM author_essays
	WHERE author_id = $1
	ORDER BY sort_order ASC;`

	essayRows, err := r.db.Pool().QueryContext(ctx, essayQuery, authorID)
	if err == nil {
		defer essayRows.Close()
		for essayRows.Next() {
			var essay models.OpusEssay
			var insightsJSON []byte
			if err := essayRows.Scan(
				&essay.Slug,
				&essay.Title,
				&essay.Date,
				&essay.Theme,
				&essay.Abstract,
				&essay.Content,
				&insightsJSON,
			); err == nil {
				_ = json.Unmarshal(insightsJSON, &essay.KeyInsights)
				opus.Essays = append(opus.Essays, essay)
			}
		}
	}

	// Life Events
	eventsQuery := `
	SELECT period, title, cycle, description, mercurial_resonance
	FROM author_life_events
	WHERE author_id = $1
	ORDER BY sort_order ASC;`

	eventRows, err := r.db.Pool().QueryContext(ctx, eventsQuery, authorID)
	if err == nil {
		defer eventRows.Close()
		for eventRows.Next() {
			var ev models.LifeEvent
			if err := eventRows.Scan(
				&ev.Period,
				&ev.Title,
				&ev.Cycle,
				&ev.Description,
				&ev.MercurialResonance,
			); err == nil {
				opus.Chronology = append(opus.Chronology, ev)
			}
		}
	}

	return &opus, nil
}

// GetTransitionPortal fetches the Saturn-Jupiter -> Mercury Dasha Chidra threshold
func (r *Repository) GetTransitionPortal(ctx context.Context) (*models.DashaTransition, error) {
	if r.db == nil || !r.db.IsAlive() {
		return nil, fmt.Errorf("postgres unavailable")
	}

	query := `
	SELECT id, native_name, current_mahadasha, current_antardasha, cycle_name, target_ingress_date, theme,
	       saturnine_mastery, jupiterian_synthesis, mercurial_readiness
	FROM dasha_transitions
	WHERE id = 'shani-guru-to-budha'
	LIMIT 1;`

	var t models.DashaTransition
	var targetDate time.Time
	var saturnJSON, jupiterJSON, mercuryJSON []byte

	err := r.db.Pool().QueryRowContext(ctx, query).Scan(
		&t.ID,
		&t.NativeName,
		&t.CurrentMahadasha,
		&t.CurrentAntardasha,
		&t.CycleName,
		&targetDate,
		&t.Theme,
		&saturnJSON,
		&jupiterJSON,
		&mercuryJSON,
	)
	if err != nil {
		return nil, err
	}

	_ = json.Unmarshal(saturnJSON, &t.SaturnineMastery)
	_ = json.Unmarshal(jupiterJSON, &t.JupiterianSynthesis)
	_ = json.Unmarshal(mercuryJSON, &t.MercurialReadiness)

	t.TargetIngressDate = targetDate.Format("January 2006")
	now := time.Now()
	diff := targetDate.Sub(now)

	days := int(math.Max(0, diff.Hours()/24))
	t.DaysRemaining = days
	t.MonthsRemaining = math.Round((float64(days)/30.4375)*10) / 10

	return &t, nil
}

// GetFoundationsNarrative fetches the 3-stage Foundations story arc
func (r *Repository) GetFoundationsNarrative(ctx context.Context) ([]models.FoundationsStage, error) {
	if r.db == nil || !r.db.IsAlive() {
		return nil, fmt.Errorf("postgres unavailable")
	}

	query := `
	SELECT id, stage_number, title, subtitle, narrative, aesthetic_theme, chakra_color, frequency_hz, harmonic_blueprint_id, created_at
	FROM foundations_narrative
	ORDER BY stage_number ASC;`

	rows, err := r.db.Pool().QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stages []models.FoundationsStage
	for rows.Next() {
		var s models.FoundationsStage
		if err := rows.Scan(
			&s.ID,
			&s.StageNumber,
			&s.Title,
			&s.Subtitle,
			&s.Narrative,
			&s.AestheticTheme,
			&s.ChakraColor,
			&s.FrequencyHz,
			&s.HarmonicBlueprintID,
			&s.CreatedAt,
		); err != nil {
			return nil, err
		}
		stages = append(stages, s)
	}
	return stages, nil
}

// GetManifestoSections fetches the fundamental manifesto doctrine
func (r *Repository) GetManifestoSections(ctx context.Context) ([]models.ManifestoSection, error) {
	if r.db == nil || !r.db.IsAlive() {
		return nil, fmt.Errorf("postgres unavailable")
	}

	query := `
	SELECT id, section_number, section_title, latin_maxim, body_content, created_at
	FROM fundamental_manifesto
	ORDER BY section_number ASC;`

	rows, err := r.db.Pool().QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sections []models.ManifestoSection
	for rows.Next() {
		var s models.ManifestoSection
		if err := rows.Scan(
			&s.ID,
			&s.SectionNumber,
			&s.SectionTitle,
			&s.LatinMaxim,
			&s.BodyContent,
			&s.CreatedAt,
		); err != nil {
			return nil, err
		}
		sections = append(sections, s)
	}
	return sections, nil
}

