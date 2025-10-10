-- CreateIndex
CREATE INDEX "Booking_propertyId_startDate_endDate_idx" ON "Booking"("propertyId", "startDate", "endDate");
