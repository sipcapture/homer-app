package service

import "testing"

func TestUnixMillisFromHEP(t *testing.T) {
	// Captured in https://github.com/sipcapture/homer-app/issues/644:
	// create_date 2026-10-06 20:21:12.561636Z, timeSeconds 1791318072,
	// timeUseconds 561636. micro_ts must stay Unix milliseconds so the
	// Flow tab does not render year ~58734.
	const sec, usec int64 = 1791318072, 561636

	got := unixMillisFromHEP(sec, usec)
	const want int64 = 1791318072561
	if got != want {
		t.Fatalf("unixMillisFromHEP(%d, %d) = %d, want %d", sec, usec, got, want)
	}

	micros := sec*1000000 + usec
	if got == micros {
		t.Fatal("micro_ts must not be returned in microseconds")
	}
	if micros/got != 1000 {
		t.Fatalf("millisecond value %d is not microseconds %d / 1000", got, micros)
	}
}

func TestUnixMillisFromHEP_sameMillisecondStaysDistinctForSort(t *testing.T) {
	const sec, usec int64 = 1791318072, 561636

	earlier := sec*1000000 + usec
	later := sec*1000000 + usec + 200
	if earlier >= later {
		t.Fatal("microsecond keys must order packets inside one millisecond")
	}
	if unixMillisFromHEP(sec, usec) != unixMillisFromHEP(sec, usec+200) {
		t.Fatal("micro_ts collapses to the millisecond; sort uses the microsecond key")
	}
}
