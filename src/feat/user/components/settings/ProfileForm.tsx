import { useState, useEffect } from "react";
import { toast } from "@/shared/hook/use-toast";
import { Check, Loader2, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Label } from "@/ui/Label";
import { Textarea } from "@/ui/Textarea";
import { apiClient } from "@/infra/api/apiClient";

interface ProfileFormProps {
  profile: any;
  updateProfile: (data: any) => void;
  loading: boolean;
  strength?: {
    score: number;
    checks: {
      emailVerified: boolean;
      phoneVerified: boolean;
      hasPayment: boolean;
      hasAddress: boolean;
      hasAvatar: boolean;
      hasBio: boolean;
      hasDob: boolean;
    }
  };
}

export const ProfileForm = ({ profile, updateProfile, loading, strength }: ProfileFormProps) => {
  const [formData, setFormData] = useState(profile);
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
  const [savingAddress, setSavingAddress] = useState(false);

  // Sync state with props when profile data loads OR changes
  useEffect(() => {
    if (profile) {
      console.log('[ProfileForm] Syncing form with profile:', profile);
      setFormData({
        ...profile,
        // Ensure DOB is properly formatted for date input
        date_of_birth: profile.date_of_birth?.split('T')[0] || ''
      });
    }
  }, [profile]);

  // Fetch address on mount
  useEffect(() => {
    const loadAddress = async () => {
      try {
        const res = await apiClient.get("/users/addresses");
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

          if (mapInstance && mapMarker && defaultAddr.city) {
            try {
              const query = encodeURIComponent(`${defaultAddr.addressLine1}, ${defaultAddr.city}, ${defaultAddr.state}, India`);
              const searchRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
              const searchData = await searchRes.json();
              if (searchData && searchData.length > 0) {
                const lat = parseFloat(searchData[0].lat);
                const lon = parseFloat(searchData[0].lon);
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

    loadAddress();
  }, [mapInstance, mapMarker]);

  const initMap = (lat: number, lng: number) => {
    const L = (window as any).L;
    if (!L) return;

    const mapEl = document.getElementById("profile-settings-map");
    if (!mapEl) return;

    if ((window as any)._profileSettingsMap) {
      (window as any)._profileSettingsMap.remove();
    }

    const map = L.map("profile-settings-map").setView([lat, lng], 13);
    (window as any)._profileSettingsMap = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
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

    marker.on("dragend", () => {
      handleGeocode(marker.getLatLng());
    });

    map.on("click", (e: any) => {
      marker.setLatLng(e.latlng);
      handleGeocode(e.latlng);
    });
  };

  useEffect(() => {
    const cssId = "leaflet-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const jsId = "leaflet-js";
    if (!document.getElementById(jsId)) {
      const script = document.createElement("script");
      script.id = jsId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        initMap(13.0827, 80.2707);
      };
      document.head.appendChild(script);
    } else if ((window as any).L) {
      initMap(13.0827, 80.2707);
    }

    return () => {
      if ((window as any)._profileSettingsMap) {
        (window as any)._profileSettingsMap.remove();
        (window as any)._profileSettingsMap = null;
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
      } finally {
        setLocating(false);
      }
    }, (err) => {
      console.error(err);
      toast({ title: "Location Denied", description: "Enable location permissions or enter address manually.", variant: "destructive" });
      setLocating(false);
    });
  };

  // Fallback defaults if strength not provided
  const { score = 0, checks = {} as any } = strength || {};

  return (
    <div className="grid gap-6 md:grid-cols-12">
      <Card className="md:col-span-8 border-none shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">Personal Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. John Doe"
                className="bg-background/50 h-10"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={formData.email} disabled className="bg-muted h-10" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={formData.phone}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, phone: val });
                }}
                placeholder="e.g. 9876543210"
                maxLength={10}
                className="bg-background/50 h-10"
              />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={formData.date_of_birth?.split('T')[0] || ''}
                onChange={e => {
                  // CRITICAL: Never send empty string to backend, always use null
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    date_of_birth: value ? value : null
                  });
                  console.log('[ProfileForm] DOB changed to:', value || null);
                }}
                className="bg-background/50 h-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us a bit about yourself..."
              className="bg-background/50 min-h-[100px]"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-border/50">
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
                {locating ? "Locating..." : "Locate Me"}
              </Button>
            </div>

            {/* Map container */}
            <div className="relative group overflow-hidden rounded-xl border border-border bg-muted/10">
              <div id="profile-settings-map" className="h-[200px] w-full z-10" />
              <div className="absolute bottom-2 left-2 z-[1000] bg-background/95 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-muted-foreground font-semibold border shadow-sm select-none">
                Click map or drag marker to pinpoint location
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs">Address Line 1 (Street, Building, Area) *</Label>
                <Input
                  value={userAddress.addressLine1}
                  onChange={(e) => setUserAddress({ ...userAddress, addressLine1: e.target.value })}
                  placeholder="e.g. 123 Main Street"
                  className="bg-background/50 h-10"
                />
              </div>

              <div>
                <Label className="text-xs">Address Line 2 (Apartment, Suite, Landmark)</Label>
                <Input
                  value={userAddress.addressLine2}
                  onChange={(e) => setUserAddress({ ...userAddress, addressLine2: e.target.value })}
                  placeholder="e.g. Near City Mall"
                  className="bg-background/50 h-10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">City *</Label>
                  <Input
                    value={userAddress.city}
                    onChange={(e) => setUserAddress({ ...userAddress, city: e.target.value })}
                    placeholder="City"
                    className="bg-background/50 h-10"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">State *</Label>
                  <Input
                    value={userAddress.state}
                    onChange={(e) => setUserAddress({ ...userAddress, state: e.target.value })}
                    placeholder="State"
                    className="bg-background/50 h-10"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Pincode *</Label>
                  <Input
                    maxLength={6}
                    value={userAddress.pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setUserAddress({ ...userAddress, pincode: val });
                    }}
                    placeholder="6-digit pincode"
                    className="bg-background/50 h-10 font-mono tracking-wider"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t p-4 md:p-6 pt-4">
          <Button
            onClick={async () => {
              if (formData.phone && formData.phone.length !== 10) {
                toast({
                  title: "Validation Error",
                  description: "Mobile number must be exactly 10 digits.",
                  variant: "destructive"
                });
                return;
              }
              if (!formData.full_name) {
                toast({
                  title: "Validation Error",
                  description: "Full name is required.",
                  variant: "destructive"
                });
                return;
              }

              // Address save logic
              if (userAddress.addressLine1 || userAddress.city || userAddress.state || userAddress.pincode) {
                if (!userAddress.addressLine1 || !userAddress.city || !userAddress.state || !userAddress.pincode) {
                  toast({
                    title: "Validation Error",
                    description: "Please fill in all required address fields (Address Line 1, City, State, Pincode).",
                    variant: "destructive"
                  });
                  return;
                }

                if (!/^[1-9][0-9]{5}$/.test(userAddress.pincode)) {
                  toast({
                    title: "Validation Error",
                    description: "Pincode must be a valid 6-digit Indian pincode.",
                    variant: "destructive"
                  });
                  return;
                }

                try {
                  const addressPayload = {
                    label: "Default Shipping",
                    fullName: formData.full_name || "Default Recipient",
                    phone: formData.phone || "0000000000",
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
                } catch (e: any) {
                  console.error("Failed to save address:", e);
                  toast({
                    title: "Warning",
                    description: "Failed to update shipping address.",
                    variant: "destructive"
                  });
                  return;
                }
              }

              updateProfile(formData);
            }}
            disabled={loading || savingAddress}
            className="w-full md:w-auto gap-2"
          >
            {loading || savingAddress ? <Loader2 className="animate-spin h-4 w-4" /> : <Check className="h-4 w-4" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      <Card className="md:col-span-4 border-none shadow-lg bg-gradient-to-br from-primary/5 to-accent/5 h-fit">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-primary text-lg md:text-xl">Profile Strength</CardTitle>
          <CardDescription>Complete your profile to get the most out of Pravokha.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Completion</span>
                <span>{score}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${score}%` }}></div>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                { checked: checks.emailVerified, done: "Email Verified", todo: "Verify Email (Pending)" },
                { checked: checks.phoneVerified, done: "Phone Added", todo: "Add Phone Number" },
                { checked: checks.hasAddress, done: "Address Added", todo: "Add Address" },
                { checked: checks.hasPayment, done: "Payment Method Added", todo: "Add Payment Method" },
                { checked: checks.hasAvatar, done: "Profile Photo Added", todo: "Upload Profile Photo" },
                { checked: checks.hasBio, done: "Bio Added", todo: "Fill Bio" },
                { checked: checks.hasDob, done: "Date of Birth Added", todo: "Add Date of Birth" }
              ].map((item, i) => (
                <li key={i} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${item.checked ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10' : 'text-amber-600 bg-amber-50 dark:bg-amber-900/10 font-medium'}`}>
                  {item.checked ?
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded-full"><Check className="h-3 w-3" /></div> :
                    <div className="h-5 w-5 border-2 border-amber-300 dark:border-amber-700 rounded-full shrink-0 flex items-center justify-center text-[8px] text-amber-600">!</div>
                  }
                  {item.checked ? item.done : item.todo}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
