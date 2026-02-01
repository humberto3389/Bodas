
const { createClient } = require('@supabase/supabase-js');

// REPLACE WITH YOUR SUPABASE URL AND ANON KEY FROM CONFIG
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyReceptionSave() {
    console.log("--- Starting Reception Save Verification ---");

    // 1. Create or Find a Basic Plan Client
    const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('plan_type', 'basic')
        .maybeSingle();

    if (error || !client) {
        console.error("No valid Basic client found to test.", error);
        return;
    }

    console.log(`Testing with Client ID: ${client.id} (${client.client_name})`);
    console.log(`Current Plan: ${client.plan_type}`);

    // 2. Simulate User Input: Uncheck "Same Location", Set "Reception Place"
    const updates = {
        is_reception_same_as_ceremony: false,
        reception_location_name: "TEST RECEPTION HALL " + new Date().toISOString(),
        reception_address: "123 Test St",
        reception_time: "20:00"
    };

    console.log("Attempting to update:", updates);

    // 3. Perform Update
    const { data: updatedData, error: updateError } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', client.id)
        .select()
        .single();

    if (updateError) {
        console.error("Update FAILED:", updateError);
    } else {
        console.log("Update SUCCESS. New Data in DB:");
        console.log("Is Same Ceremony?", updatedData.is_reception_same_as_ceremony);
        console.log("Reception Location:", updatedData.reception_location_name);

        if (updatedData.reception_location_name === updates.reception_location_name) {
            console.log("✅ VERIFIED: Reception data was saved correctly for Basic plan.");
        } else {
            console.error("❌ FAILED: Saved data does not match input.");
        }
    }
}

// Note: You need valid env vars to run this.
console.log("This script requires valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.");
// verifyReceptionSave(); 
