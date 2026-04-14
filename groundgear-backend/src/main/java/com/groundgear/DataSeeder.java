package com.groundgear;

import com.groundgear.model.Equipment;
import com.groundgear.model.User;
import com.groundgear.repository.EquipmentRepository;
import com.groundgear.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("!prod")
public class DataSeeder implements CommandLineRunner {

    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(EquipmentRepository equipmentRepository,
                      UserRepository userRepository,
                      PasswordEncoder passwordEncoder) {
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        if (!userRepository.existsByUsername("admin")) {
            userRepository.save(new User("admin",
                    passwordEncoder.encode("admin123"),
                    "admin@groundgear.com", "ADMIN"));
        }

        if (!userRepository.existsByUsername("testuser")) {
            userRepository.save(new User("testuser",
                    passwordEncoder.encode("test123"),
                    "test@groundgear.com", "USER"));
        }

        if (equipmentRepository.count() == 0) {
            // Emojis: distinct per item (Unicode pictographs; motion is CSS on the frontend)
            equipmentRepository.save(new Equipment("Cricket Bat", "Cricket",
                    "Full size cricket bat, suitable for all ages",
                    true, "🏏", 500.0, 5, 5));
            equipmentRepository.save(new Equipment("Cricket Ball", "Cricket",
                    "Premium leather cricket ball",
                    true, "⚪", 100.0, 10, 10));
            equipmentRepository.save(new Equipment("Cricket Stumps", "Cricket",
                    "Full set of stumps with bails",
                    true, "🪵", 300.0, 3, 3));
            equipmentRepository.save(new Equipment("Football", "Football",
                    "FIFA approved size 5 football",
                    true, "⚽", 300.0, 4, 4));
            equipmentRepository.save(new Equipment("Basketball", "Basketball",
                    "Size 7 basketball, official match standard",
                    true, "🏀", 300.0, 3, 3));
            equipmentRepository.save(new Equipment("Badminton Racket", "Badminton",
                    "Lightweight racket with shuttlecock",
                    true, "🏸", 200.0, 6, 6));
            equipmentRepository.save(new Equipment("Volleyball", "Volleyball",
                    "Official size volleyball",
                    true, "🏐", 250.0, 3, 3));
            equipmentRepository.save(new Equipment("Tennis Racket", "Tennis",
                    "Professional grade tennis racket",
                    true, "🎾", 400.0, 4, 4));
            equipmentRepository.save(new Equipment("Table Tennis Bat", "Table Tennis",
                    "Professional table tennis bat",
                    true, "🏓", 150.0, 8, 8));
            equipmentRepository.save(new Equipment("Boxing Gloves", "Boxing",
                    "Padded boxing gloves, safe for all levels",
                    true, "🥊", 350.0, 4, 4));
            equipmentRepository.save(new Equipment("Rugby Ball", "Rugby",
                    "Official size rugby ball",
                    true, "🏉", 280.0, 3, 3));
            equipmentRepository.save(new Equipment("Hockey Stick", "Hockey",
                    "Fiberglass hockey stick",
                    true, "🏑", 320.0, 5, 5));
        }
    }
}