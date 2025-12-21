'use client';

import { use } from 'react';
import Link from 'next/link';
import { useGetVendorByIdQuery } from '@/store/api/businessApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    Globe,
    MapPin,
    Calendar,
    FileText,
    Star,
    Users,
    DollarSign,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    ACTIVE: { label: 'Active', variant: 'default' },
    INACTIVE: { label: 'Inactive', variant: 'secondary' },
    SUSPENDED: { label: 'Suspended', variant: 'destructive' },
    PENDING: { label: 'Pending', variant: 'outline' },
    BLACKLISTED: { label: 'Blacklisted', variant: 'destructive' },
};

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: vendorResponse, isLoading } = useGetVendorByIdQuery(id);
    const vendor = vendorResponse?.data as any;

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64" />
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="p-4 md:p-6">
                <div className="text-center py-12">
                    <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Vendor not found</h3>
                    <Button className="mt-4" asChild>
                        <Link href="/business/vendors">Back to Vendors</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const status = statusConfig[vendor.status] || statusConfig.ACTIVE;
    const addr = vendor.address as any;
    const address = addr
        ? typeof addr === 'string'
            ? addr
            : [addr.street, addr.city, addr.state, addr.country].filter(Boolean).join(', ')
        : null;

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/business/vendors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">{vendor.name}</h1>
                        <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    {vendor.registrationNumber && (
                        <p className="text-muted-foreground mt-1">
                            Registration: {vendor.registrationNumber}
                        </p>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Contact Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {vendor.contactEmail && (
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <a href={`mailto:${vendor.contactEmail}`} className="text-primary hover:underline">
                                        {vendor.contactEmail}
                                    </a>
                                </div>
                            )}
                            {vendor.contactPhone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{vendor.contactPhone}</span>
                                </div>
                            )}
                            {vendor.website && (
                                <div className="flex items-center gap-3">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <a href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="text-primary hover:underline">
                                        {vendor.website}
                                    </a>
                                </div>
                            )}
                            {address && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                    <span>{address}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Business Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {vendor.businessType && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Business Type</p>
                                    <p className="font-medium">{vendor.businessType}</p>
                                </div>
                            )}
                            {vendor.taxId && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Tax ID</p>
                                    <p className="font-medium">{vendor.taxId}</p>
                                </div>
                            )}
                            {vendor.yearEstablished && (
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Established {vendor.yearEstablished}</span>
                                </div>
                            )}
                            {vendor.employeeCount && (
                                <div className="flex items-center gap-3">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>{vendor.employeeCount} employees</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Stats and More */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500" />
                                    <span className="text-2xl font-bold">{vendor.rating || 'N/A'}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Contracts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <span className="text-2xl font-bold">{vendor.totalContracts || 0}</span>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <span className="text-2xl font-bold">
                                    {vendor.onTimeDelivery ? `${vendor.onTimeDelivery}%` : 'N/A'}
                                </span>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Annual Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    <span className="text-lg font-bold">
                                        {vendor.annualRevenue
                                            ? Number(vendor.annualRevenue).toLocaleString()
                                            : 'N/A'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Certifications */}
                    {vendor.certifications && vendor.certifications.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Certifications</CardTitle>
                                <CardDescription>Quality and compliance certifications</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {vendor.certifications.map((cert: string, index: number) => (
                                        <Badge key={index} variant="secondary">{cert}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Bank Details */}
                    {vendor.bankDetails && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Bank Details</CardTitle>
                                <CardDescription>Payment information</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    {vendor.bankDetails.bankName && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Bank Name</p>
                                            <p className="font-medium">{vendor.bankDetails.bankName}</p>
                                        </div>
                                    )}
                                    {vendor.bankDetails.accountNumber && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Account Number</p>
                                            <p className="font-medium">{vendor.bankDetails.accountNumber}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
