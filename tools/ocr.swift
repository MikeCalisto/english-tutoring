import Foundation
import Vision
import AppKit

// Распознаёт текст на картинке через macOS Vision. Выводит строки сверху вниз, слева направо.
let args = CommandLine.arguments
guard args.count > 1, let img = NSImage(contentsOfFile: args[1]),
      let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    FileHandle.standardError.write("usage: ocr <image>\n".data(using: .utf8)!); exit(1)
}
let req = VNRecognizeTextRequest()
req.recognitionLevel = (args.count > 3 && args[3] == "fast") ? .fast : .accurate
req.recognitionLanguages = ["en-US"]
req.usesLanguageCorrection = (args.count > 2 && args[2] == "lc")
let handler = VNImageRequestHandler(cgImage: cg, options: [:])
try handler.perform([req])
let obs = (req.results ?? []).compactMap { o -> (String, CGRect)? in
    guard let c = o.topCandidates(1).first else { return nil }
    return (c.string, o.boundingBox)
}
// bbox: origin bottom-left, normalized. Сортируем по y (сверху), потом по x.
let sorted = obs.sorted { a, b in
    let ay = 1 - a.1.midY, by = 1 - b.1.midY
    if abs(ay - by) > 0.006 { return ay < by }
    return a.1.minX < b.1.minX
}
for (s, r) in sorted {
    print(String(format: "%.4f\t%.4f\t%@", 1 - r.midY, r.minX, s))
}
