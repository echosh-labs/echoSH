package boltdb

import (
	"crypto/sha256"
	"encoding/binary"
	"encoding/json"
	"time"

	bolt "go.etcd.io/bbolt"
)

var (
	BucketOracleDaily    = []byte("oracle_daily")
	BucketThoughtStreams = []byte("thought_streams")
)

type OracleContemplation struct {
	Date          string   `json:"date"`
	DayOfWeek     string   `json:"day_of_week"`
	Theme         string   `json:"theme"`
	Aphorism      string   `json:"aphorism"`
	PresidingDeity string  `json:"presiding_deity"`
	HermeticKey   string   `json:"hermetic_key"`
	DailyExercise string   `json:"daily_exercise"`
	MercurialTune []string `json:"mercurial_tune"`
}

type ThoughtStreamEntry struct {
	ID        string    `json:"id"`
	Content   string    `json:"content"`
	Category  string    `json:"category"`
	CreatedAt time.Time `json:"created_at"`
}

var OracleAphorisms = []OracleContemplation{
	{
		Theme:         "The Fluidity of Thought (Quicksilver Mind)",
		Aphorism:      "The mind that clings to form becomes brittle like glass; the mind that flows like Hydrargyrum reflects the infinite cosmos without fracture.",
		PresidingDeity: "Hermes Trismegistus & Budha",
		HermeticKey:   "Principle of Mentalism: The All is Mind.",
		DailyExercise: "Observe a rigid opinion you hold today and actively articulate its harmonic opposite.",
		MercurialTune: []string{"Adaptability", "Linguistic Transmutation", "Serene Perception"},
	},
	{
		Theme:         "The Sacred Potency of Vak (Speech Alchemy)",
		Aphorism:      "Every spoken word is a metaphysical signature. Speak with the precision of a craftsman carving emerald, and reality shall reshape to your cadence.",
		PresidingDeity: "Lord Vishnu & Goddess Saraswati",
		HermeticKey:   "Principle of Vibration: Nothing rests; everything moves; everything vibrates.",
		DailyExercise: "Practice deliberate silence for 15 minutes at solar noon; speak only when the thought is distilled to pure essence.",
		MercurialTune: []string{"Phonetic Clarity", "Creative Invocation", "Truth Discernment"},
	},
	{
		Theme:         "The Middle Pillar (Reconciling Sulfur and Salt)",
		Aphorism:      "Volition without body burns itself away; matter without spirit turns to dust. Mercury stands between the flame and the stone, weaving both into living gold.",
		PresidingDeity: "Thoth & The Sarpas (Nagas)",
		HermeticKey:   "Principle of Polarity: Opposites are identical in nature, but different in degree.",
		DailyExercise: "Identify where your physical body (Salt) and your creative ambition (Sulfur) are in friction, and introduce fluid breathing (Mercury).",
		MercurialTune: []string{"Tria Prima Balance", "Synaptic Synthesis", "Pranic Alignment"},
	},
}

// GetDailyOracle retrieves today's mercurial contemplation from BoltDB or computes a deterministic daily seed
func (s *Store) GetDailyOracle() (*OracleContemplation, error) {
	today := time.Now().Format("2006-01-02")
	var contemplation OracleContemplation

	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(BucketOracleDaily)
		if b == nil {
			return nil
		}
		data := b.Get([]byte(today))
		if data != nil {
			return json.Unmarshal(data, &contemplation)
		}
		return nil
	})

	if err == nil && contemplation.Aphorism != "" {
		return &contemplation, nil
	}

	// Deterministically pick today's contemplation based on date hash
	h := sha256.Sum256([]byte(today))
	seed := binary.BigEndian.Uint64(h[:8])
	idx := int(seed % uint64(len(OracleAphorisms)))

	item := OracleAphorisms[idx]
	item.Date = today
	item.DayOfWeek = time.Now().Weekday().String()

	// Store in BoltDB
	_ = s.db.Update(func(tx *bolt.Tx) error {
		b, err := tx.CreateBucketIfNotExists(BucketOracleDaily)
		if err != nil {
			return err
		}
		data, _ := json.Marshal(item)
		return b.Put([]byte(today), data)
	})

	return &item, nil
}
