export type VerificationStatus = 'VERIFIED' | 'PENDING' | 'REJECTED';

export interface AttendanceResponse {
    id: string;
    date: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    employeeName: string;
    checkInLatitude: string | null;
    checkOutLatitude: string | null;
    checkInLongitude: string | null;
    checkOutLongitude: string | null;
    status: VerificationStatus;
    location: string | null;
    totalHours: number | null;
}
