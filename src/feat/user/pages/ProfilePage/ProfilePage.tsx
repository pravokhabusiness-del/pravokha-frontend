import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/infra/api/apiClient";
import { Card } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Label } from "@/ui/Label";
import { Separator } from "@/ui/Separator";
import { Switch } from "@/ui/Switch";
import { Textarea } from "@/ui/Textarea";
import { useToast } from "@/shared/hook/use-toast";
import { User as UserIcon, Package, LogOut, Save, Moon, Sun, Bell, Shield, Eye, EyeOff, Mail, Phone, MapPin, Camera, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/Avatar";
import { useTheme } from "next-themes";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/ui/Collapsible";
import { useProfile } from "@/shared/hook/useProfile";
import { useAuth } from "@/core/context/AuthContext";
import { getMediaUrl } from "@/lib/utils";
import { profileUpdateSchema } from "@/shared/validation/user.schema";
import { ZodError } from "zod";

export function ProfilePage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();
    const { user, signOut, loading: authLoading, refreshProfile: refreshAuthProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const { profile: userProfile, refreshProfile } = useProfile(user?.id);
    const [profile, setProfile] = useState({
        full_name: "",
        phone: "",
        address: "",
        avatar_url: user?.avatar_url || "",
    });
    const [userAddress, setUserAddress] = useState({
        id: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
    });
    const [mapInstance, setMapInstance] = useState<any>(null);
    const [mapMarker, setMapMarker] = useState<any>(null);
    const [locating, setLocating] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [notifications, setNotifications] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);
    const [password, setPassword] = useState({
        current: "",
        new: "",
        confirm: "",
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) {
            loadRecentOrders(user.id);
        }
    }, [user]);

    useEffect(() => {
        if (userProfile) {
            setProfile({
                full_name: userProfile.full_name || "",
                phone: userProfile.phone || "",
                address: userProfile.address || "",
                avatar_url: userProfile.avatar_url || "",
            });
            setAvatarPreview(userProfile.avatar_url || null);
        }
    }, [userProfile]);

    // Fetch address from backend on mount
    useEffect(() => {
        const loadUserAddress = async () => {
            try {
                const res = await apiClient.get('/users/addresses');
                if (res.data && res.data.length > 0) {
                    const defaultAddr = res.data.find((addr: any) => addr.isDefault) || res.data[0];
                    setUserAddress({
                        id: defaultAddr.id || "",
                        addressLine1: defaultAddr.addressLine1 || "",
                        addressLine2: defaultAddr.addressLine2 || "",
                        city: defaultAddr.city || "",
                        state: defaultAddr.state || "",
                        pincode: defaultAddr.pincode || "",
                    });

                    // Update map marker if map exists
                    if (mapInstance && mapMarker && defaultAddr.city) {
                        try {
                            const mapQuery = encodeURIComponent(`${defaultAddr.addressLine1}, ${defaultAddr.city}, ${defaultAddr.state}, India`);
                            const mapRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${mapQuery}`);
                            const mapData = await mapRes.json();
                            if (mapData && mapData.length > 0) {
                                const lat = parseFloat(mapData[0].lat);
                                const lon = parseFloat(mapData[0].lon);
                                mapInstance.setView([lat, lon], 14);
                                mapMarker.setLatLng([lat, lon]);
                            }
                        } catch (e) {
                            console.error("Map repositioning failed:", e);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load user address:", err);
            }
        };

        if (user) {
            loadUserAddress();
        }
    }, [user, mapInstance, mapMarker]);

    const initMap = (lat: number, lng: number) => {
        const L = (window as any).L;
        if (!L) return;

        const mapEl = document.getElementById('profile-map');
        if (!mapEl) return;

        if ((window as any)._profileMap) {
            (window as any)._profileMap.remove();
        }

        const map = L.map('profile-map').setView([lat, lng], 13);
        (window as any)._profileMap = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        setMapMarker(marker);
        setMapInstance(map);

        const handleGeocode = async (coords: { lat: number; lng: number }) => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
                const data = await response.json();
                if (data && data.address) {
                    const addr = data.address;
                    const road = addr.road || addr.suburb || addr.neighbourhood || addr.amenity || '';
                    const city = addr.city || addr.town || addr.village || '';
                    const state = addr.state || '';
                    const pincode = addr.postcode || '';

                    setUserAddress(prev => ({
                        ...prev,
                        addressLine1: road || prev.addressLine1 || "Located Address",
                        city: city || prev.city,
                        state: state || prev.state,
                        pincode: pincode.replace(/\s/g, '') || prev.pincode
                    }));
                }
            } catch (e) {
                console.error("Geocoding failed:", e);
            }
        };

        marker.on('dragend', () => {
            const position = marker.getLatLng();
            handleGeocode(position);
        });

        map.on('click', (e: any) => {
            marker.setLatLng(e.latlng);
            handleGeocode(e.latlng);
        });
    };

    // Load Leaflet dynamically
    useEffect(() => {
        const leafletCssId = 'leaflet-css';
        if (!document.getElementById(leafletCssId)) {
            const link = document.createElement('link');
            link.id = leafletCssId;
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        const leafletJsId = 'leaflet-js';
        if (!document.getElementById(leafletJsId)) {
            const script = document.createElement('script');
            script.id = leafletJsId;
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => {
                const lat = 13.0827;
                const lng = 80.2707;
                initMap(lat, lng);
            };
            document.head.appendChild(script);
        } else if ((window as any).L) {
            const lat = 13.0827;
            const lng = 80.2707;
            initMap(lat, lng);
        }

        return () => {
            if ((window as any)._profileMap) {
                (window as any)._profileMap.remove();
                (window as any)._profileMap = null;
            }
        };
    }, []);

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            toast({ title: "Not Supported", description: "Geolocation is not supported by your browser.", variant: "destructive" });
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            if (mapInstance && mapMarker) {
                mapInstance.setView([latitude, longitude], 15);
                mapMarker.setLatLng([latitude, longitude]);
            } else {
                initMap(latitude, longitude);
            }

            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                if (data && data.address) {
                    const addr = data.address;
                    const road = addr.road || addr.suburb || addr.neighbourhood || addr.amenity || '';
                    const city = addr.city || addr.town || addr.village || '';
                    const state = addr.state || '';
                    const pincode = addr.postcode || '';

                    setUserAddress(prev => ({
                        ...prev,
                        addressLine1: road || "Located Address",
                        city: city,
                        state: state,
                        pincode: pincode.replace(/\s/g, '')
                    }));
                    toast({ title: "Location Found", description: `Detected: ${city}, ${state}` });
                }
            } catch (e) {
                console.error("Geocoding failed:", e);
                toast({ title: "Detection Warning", description: "Located coordinates but failed to fetch address details." });
            } finally {
                setLocating(false);
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            toast({ title: "Location Denied", description: "Enable GPS/location permissions or enter address manually.", variant: "destructive" });
            setLocating(false);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "Error",
                description: "Image size must be less than 5MB",
                variant: "destructive",
            });
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast({
                title: "Error",
                description: "Please upload an image file",
                variant: "destructive",
            });
            return;
        }

        setUploadingImage(true);

        try {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);

            // Upload to backend
            const formData = new FormData();
            formData.append('files', file);

            const uploadResponse = await apiClient.post('/uploads/multiple', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (!uploadResponse.data.success || !uploadResponse.data.urls?.[0]) {
                throw new Error('Upload failed');
            }

            const publicUrl = uploadResponse.data.urls[0];

            // Update profile with new avatar URL
            const profileResponse = await apiClient.patch('/users/profile', { avatarUrl: publicUrl });

            if (!profileResponse.data.success) {
                throw new Error('Profile update failed');
            }

            setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
            await refreshProfile();
            if (refreshAuthProfile) {
                await refreshAuthProfile();
            }
            toast({
                title: "Success!",
                description: "Profile image updated successfully",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || 'Failed to upload image',
                variant: "destructive",
            });
        } finally {
            setUploadingImage(false);
        }
    };

    const loadRecentOrders = async (userId: string) => {
        try {
            const response = await apiClient.get("/orders", {
                params: { userId, limit: 5 }
            });

            if (response.data.success) {
                setRecentOrders(response.data.orders || []);
            }
        } catch (error) {
            console.error("Error loading orders:", error);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setFormErrors({});

        // Validation using Zod
        try {
            profileUpdateSchema.parse({
                name: profile.full_name,
                phone: profile.phone,
                bio: (userProfile as any)?.bio, // Using existing bio if not changed
                avatarUrl: profile.avatar_url
            });
        } catch (error) {
            if (error instanceof ZodError) {
                const errors: Record<string, string> = {};
                error.errors.forEach(err => {
                    const path = err.path[0] === 'name' ? 'full_name' : err.path[0].toString();
                    errors[path] = err.message;
                });
                setFormErrors(errors);
                toast({ title: "Validation Error", description: "Please check the form for errors", variant: "destructive" });
                return;
            }
        }

        setSaving(true);
        try {
            const response = await apiClient.patch("/users/profile", {
                name: profile.full_name,
                phone: profile.phone ? profile.phone.replace(/\D/g, '') : null,
                avatarUrl: profile.avatar_url,
            });

            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to update profile");
            }

            // Save address via addresses API if populated
            if (userAddress.addressLine1 || userAddress.city || userAddress.state || userAddress.pincode) {
                if (!userAddress.addressLine1 || !userAddress.city || !userAddress.state || !userAddress.pincode) {
                    toast({
                        title: "Validation Error",
                        description: "Please fill in all required address fields (Address Line 1, City, State, Pincode).",
                        variant: "destructive"
                    });
                    setSaving(false);
                    return;
                }

                if (!/^[1-9][0-9]{5}$/.test(userAddress.pincode)) {
                    toast({
                        title: "Validation Error",
                        description: "Pincode must be a valid 6-digit Indian pincode.",
                        variant: "destructive"
                    });
                    setSaving(false);
                    return;
                }

                const addressPayload = {
                    label: "Default Shipping",
                    fullName: profile.full_name || "Default Recipient",
                    phone: profile.phone || "0000000000",
                    addressLine1: userAddress.addressLine1,
                    addressLine2: userAddress.addressLine2 || "",
                    city: userAddress.city,
                    state: userAddress.state,
                    pincode: userAddress.pincode,
                    isDefault: true,
                };

                if (userAddress.id) {
                    await apiClient.patch(`/users/addresses/${userAddress.id}`, addressPayload);
                } else {
                    const res = await apiClient.post('/users/addresses', addressPayload);
                    if (res.data && res.data.id) {
                        setUserAddress(prev => ({ ...prev, id: res.data.id }));
                    }
                }
            }

            await refreshProfile();
            if (refreshAuthProfile) {
                await refreshAuthProfile();
            }

            toast({
                title: "Success",
                description: "Profile updated successfully",
                className: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            });
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast({
                title: "Error",
                description: "Failed to update profile: " + (error.message || "Unknown error"),
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (userProfile) {
            setProfile({
                full_name: userProfile.full_name || "",
                phone: userProfile.phone || "",
                address: userProfile.address || "",
                avatar_url: userProfile.avatar_url || "",
            });
            setAvatarPreview(userProfile.avatar_url || null);

            // Re-fetch address
            apiClient.get('/users/addresses').then(res => {
                if (res.data && res.data.length > 0) {
                    const defaultAddr = res.data.find((addr: any) => addr.isDefault) || res.data[0];
                    setUserAddress({
                        id: defaultAddr.id || "",
                        addressLine1: defaultAddr.addressLine1 || "",
                        addressLine2: defaultAddr.addressLine2 || "",
                        city: defaultAddr.city || "",
                        state: defaultAddr.state || "",
                        pincode: defaultAddr.pincode || "",
                    });
                }
            }).catch(e => console.error("Error reverting address:", e));

            toast({
                title: "Changes discarded",
                description: "Your profile has been reset to its previous state.",
            });
        }
    };

    const handlePasswordChange = async () => {
        if (!password.new || !password.confirm) {
            toast({
                title: "Error",
                description: "Please fill in all password fields",
                variant: "destructive",
            });
            return;
        }

        if (password.new !== password.confirm) {
            toast({
                title: "Error",
                description: "New passwords do not match",
                variant: "destructive",
            });
            return;
        }

        if (password.new.length < 8) {
            toast({
                title: "Error",
                description: "Password must be at least 8 characters",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await apiClient.post('/auth/change-password', {
                newPassword: password.new
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Password change failed');
            }

            toast({
                title: "Success",
                description: "Password updated successfully",
            });
            setPassword({ current: "", new: "", confirm: "" });
            setIsPasswordSectionOpen(false);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || 'Failed to change password',
                variant: "destructive",
            });
        }
    };

    const handleLogout = async () => {
        await signOut();
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        );
    }

    const initials = profile.full_name
        ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase()
        : user?.email?.[0].toUpperCase();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <main className="w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
                <div className="max-w-5xl mx-auto space-y-6">
                    <Card className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="relative">
                                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24">
                                    <AvatarImage src={avatarPreview || getMediaUrl(profile.avatar_url || user?.avatar_url)} alt="Profile" />
                                    <AvatarFallback className="text-lg sm:text-xl md:text-2xl bg-primary text-primary-foreground">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <Input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploadingImage}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="secondary"
                                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                                    disabled={uploadingImage}
                                    onClick={() => document.getElementById('avatar-upload')?.click()}
                                >
                                    <Camera className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex-1">
                                <h1 className="responsive-h1">
                                    {profile.full_name || "User profile"}
                                </h1>
                                <p className="responsive-body text-muted-foreground truncate">{user?.email}</p>
                                {uploadingImage && (
                                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Uploading image...</p>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            <h2 className="responsive-h3">Profile information</h2>
                        </div>
                        <Separator className="mb-4" />

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name" className="responsive-label">Full name</Label>
                                <Input
                                    id="name"
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    placeholder="Enter your full name"
                                />
                                {formErrors.full_name && <p className="text-xs text-destructive mt-1">{formErrors.full_name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="email" className="responsive-label">Email</Label>
                                <Input
                                    id="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="bg-muted responsive-body"
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone" className="responsive-label">Phone number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        value={profile.phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            setProfile({ ...profile, phone: val });
                                        }}
                                        placeholder="Enter your 10-digit phone number"
                                        className="pl-10"
                                        maxLength={10}
                                    />
                                </div>
                                {formErrors.phone && <p className="text-xs text-destructive mt-1">{formErrors.phone}</p>}
                                <p className="responsive-small text-muted-foreground mt-1">
                                    Required for order updates via SMS
                                </p>
                            </div>
                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        Shipping Address & Delivery Location
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLocateMe}
                                        disabled={locating}
                                        className="h-8 gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/5 hover:text-primary transition-all font-semibold"
                                    >
                                        {locating ? (
                                            <>Locating...</>
                                        ) : (
                                            <>Locate Me</>
                                        )}
                                    </Button>
                                </div>

                                {/* Leaflet Map container */}
                                <div className="relative group overflow-hidden rounded-xl border border-border bg-muted/10">
                                    <div id="profile-map" className="h-[200px] w-full z-10" />
                                    <div className="absolute bottom-2 left-2 z-[1000] bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-muted-foreground font-semibold border shadow-sm select-none">
                                        Click map or drag marker to pinpoint location
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="addressLine1" className="responsive-label text-xs">Address Line 1 (Street, Building, Area) *</Label>
                                        <Input
                                            id="addressLine1"
                                            value={userAddress.addressLine1}
                                            onChange={(e) => setUserAddress({ ...userAddress, addressLine1: e.target.value })}
                                            placeholder="e.g. 123 Main Street"
                                            className="h-9 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="addressLine2" className="responsive-label text-xs">Address Line 2 (Apartment, Suite, Landmark)</Label>
                                        <Input
                                            id="addressLine2"
                                            value={userAddress.addressLine2}
                                            onChange={(e) => setUserAddress({ ...userAddress, addressLine2: e.target.value })}
                                            placeholder="e.g. Near City Mall"
                                            className="h-9 text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <Label htmlFor="city" className="responsive-label text-xs">City *</Label>
                                            <Input
                                                id="city"
                                                value={userAddress.city}
                                                onChange={(e) => setUserAddress({ ...userAddress, city: e.target.value })}
                                                placeholder="City"
                                                className="h-9 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="state" className="responsive-label text-xs">State *</Label>
                                            <Input
                                                id="state"
                                                value={userAddress.state}
                                                onChange={(e) => setUserAddress({ ...userAddress, state: e.target.value })}
                                                placeholder="State"
                                                className="h-9 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="pincode" className="responsive-label text-xs">Pincode *</Label>
                                            <Input
                                                id="pincode"
                                                maxLength={6}
                                                value={userAddress.pincode}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                                    setUserAddress({ ...userAddress, pincode: val });
                                                }}
                                                placeholder="6-digit pincode"
                                                className="h-9 text-sm font-mono tracking-wider"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button onClick={handleSave} disabled={saving} className="flex-1 responsive-button">
                                    <Save className="h-4 w-4 mr-2" />
                                    {saving ? "Saving..." : "Save changes"}
                                </Button>
                                <Button onClick={handleCancel} disabled={saving} variant="outline" className="flex-1 responsive-button border-border/50">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 sm:p-6 bg-primary/5 border-primary/20">
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-primary" />
                            <div>
                                <h3 className="font-bold">Account Security</h3>
                                <p className="text-sm text-muted-foreground">Manage your password and security settings in the Account Settings tab.</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto"
                                onClick={() => navigate("/user/account/settings")}
                            >
                                Manage
                            </Button>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default ProfilePage;
