package com.example.selfcarehero

import com.example.selfcarehero.model.DateUtils
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class DateUtilsTest {

    @Test
    fun testDaysBetweenNormal() {
        val diff = DateUtils.daysBetween("2026-10-01", "2026-10-05")
        assertEquals(4, diff)
    }

    @Test
    fun testDaysBetweenSameDay() {
        val diff = DateUtils.daysBetween("2026-10-28", "2026-10-28")
        assertEquals(0, diff)
    }

    @Test
    fun testDaysBetweenConsecutiveDays() {
        val diff = DateUtils.daysBetween("2026-03-08", "2026-03-09")
        assertEquals(1, diff)
    }

    @Test
    fun testDaysBetweenMonthBoundary() {
        val diff = DateUtils.daysBetween("2026-02-28", "2026-03-01")
        assertEquals(1, diff)
    }

    @Test
    fun testCurrentWeekMondayFormat() {
        val mondayStr = DateUtils.currentWeekMondayStr()
        assertTrue(mondayStr.matches(Regex("\\d{4}-\\d{2}-\\d{2}")))
    }

    @Test
    fun testGetDatesBetween() {
        val dates = DateUtils.getDatesBetween("2026-10-01", "2026-10-03")
        assertEquals(listOf("2026-10-01", "2026-10-02", "2026-10-03"), dates)
    }

    @Test
    fun testGetDatesBetweenInvalidReversed() {
        val dates = DateUtils.getDatesBetween("2026-10-05", "2026-10-01")
        assertTrue(dates.isEmpty())
    }
}
